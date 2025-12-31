const PDFGenerator = {
    // Remove ** markers from text
    stripBold(text) {
        return text.replace(/\*\*/g, '');
    },
    
    // Parse text with **bold** markers and return segments
    parseTextWithBold(text) {
        const segments = [];
        const regex = /\*\*([^*]+)\*\*/g;
        let lastIndex = 0;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                segments.push({ text: text.slice(lastIndex, match.index), bold: false });
            }
            segments.push({ text: match[1], bold: true });
            lastIndex = match.index + match[0].length;
        }
        
        if (lastIndex < text.length) {
            segments.push({ text: text.slice(lastIndex), bold: false });
        }
        
        if (segments.length === 0) {
            segments.push({ text: text, bold: false });
        }
        
        return segments;
    },
    
    // Render text with bold segments, returns number of lines
    renderText(doc, text, x, y, fontSize, maxWidth, color = '#333333') {
        const segments = this.parseTextWithBold(text);
        const plainText = segments.map(s => s.text).join('');
        
        doc.setFontSize(fontSize);
        doc.setTextColor(color);
        doc.setFont('helvetica', 'normal');
        
        const testLines = doc.splitTextToSize(plainText, maxWidth);
        
        if (testLines.length === 1) {
            // Single line - render with proper bold
            let cx = x;
            segments.forEach(seg => {
                doc.setFont('helvetica', seg.bold ? 'bold' : 'normal');
                doc.text(seg.text, cx, y);
                cx += doc.getTextWidth(seg.text);
            });
            return 1;
        } else {
            // Multi-line with bold support
            let currentLine = '';
            let lineSegments = [];
            let lines = [];
            
            segments.forEach(seg => {
                const words = seg.text.split(' ');
                words.forEach((word, wi) => {
                    const space = currentLine ? ' ' : '';
                    const testText = currentLine + space + word;
                    
                    doc.setFont('helvetica', 'normal');
                    if (doc.getTextWidth(testText) <= maxWidth) {
                        currentLine = testText;
                        const addText = space + word;
                        if (lineSegments.length === 0 || lineSegments[lineSegments.length - 1].bold !== seg.bold) {
                            lineSegments.push({ text: addText, bold: seg.bold });
                        } else {
                            lineSegments[lineSegments.length - 1].text += addText;
                        }
                    } else {
                        if (lineSegments.length) {
                            lines.push([...lineSegments]);
                        }
                        currentLine = word;
                        lineSegments = [{ text: word, bold: seg.bold }];
                    }
                });
            });
            
            if (lineSegments.length) {
                lines.push(lineSegments);
            }
            
            // Render each line
            lines.forEach((lineSegs, lineIdx) => {
                let cx = x;
                lineSegs.forEach((seg, segIdx) => {
                    doc.setFont('helvetica', seg.bold ? 'bold' : 'normal');
                    const txt = segIdx === 0 ? seg.text.trimStart() : seg.text;
                    doc.text(txt, cx, y + lineIdx * (fontSize * 1.35));
                    cx += doc.getTextWidth(txt);
                });
            });
            
            return lines.length;
        }
    },
    
    createResume(personalInfo, resumeData, options) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'pt', format: 'letter' });
        
        const margin = 50;
        const pageWidth = 612;
        const contentWidth = pageWidth - (margin * 2);
        let y = 45;
        
        const checkPage = (need = 70) => {
            if (y + need > 730) { doc.addPage(); y = 45; }
        };
        
        const addSectionHeader = (title) => {
            checkPage(50);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor('#1a1a1a');
            doc.text(title, margin, y);
            y += 6;
            doc.setDrawColor('#888888');
            doc.setLineWidth(0.75);
            doc.line(margin, y, pageWidth - margin, y);
            y += 18;
        };
        
        // === NAME ===
        doc.setFontSize(26);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#1a1a1a');
        doc.text(personalInfo.fullName || 'Your Name', pageWidth / 2, y, { align: 'center' });
        y += 28;
        
        // === CONTACT ===
        const contacts = [
            personalInfo.email,
            personalInfo.phone,
            personalInfo.linkedIn?.replace(/^https?:\/\/(www\.)?/, ''),
            personalInfo.github?.replace(/^https?:\/\/(www\.)?/, '')
        ].filter(Boolean);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#555555');
        doc.text(contacts.join('   |   '), pageWidth / 2, y, { align: 'center' });
        y += 28;
        
        // === SUMMARY ===
        if (resumeData.summary) {
            doc.setFontSize(12);
            const lines = this.renderText(doc, resumeData.summary, margin, y, 12, contentWidth);
            y += lines * 16 + 18;
        }
        
        // === SKILLS (with subcategories, no bold) ===
        const renderSkills = () => {
            if (!resumeData.skills) return;
            
            const hasSkills = (resumeData.skills.technical?.length || 
                              resumeData.skills.tools?.length ||
                              resumeData.skills.databases?.length ||
                              resumeData.skills.cloud?.length ||
                              resumeData.skills.certifications?.length ||
                              resumeData.skills.languages?.length);
            if (!hasSkills) return;
            
            addSectionHeader('SKILLS');
            
            const skillCategories = [
                { label: 'Languages & Frameworks', items: resumeData.skills.technical },
                { label: 'Tools & Platforms', items: resumeData.skills.tools },
                { label: 'Databases', items: resumeData.skills.databases },
                { label: 'Cloud & DevOps', items: resumeData.skills.cloud },
                { label: 'Certifications', items: resumeData.skills.certifications },
                { label: 'Spoken Languages', items: resumeData.skills.languages }
            ];
            
            skillCategories.forEach(cat => {
                if (!cat.items?.length) return;
                checkPage(25);
                
                // Clean skills - remove any ** markers
                const cleanedSkills = cat.items.map(s => this.stripBold(s));
                
                // Category label
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor('#444444');
                doc.text(cat.label + ':', margin, y);
                
                // Skills text
                const labelWidth = doc.getTextWidth(cat.label + ':  ');
                doc.setFont('helvetica', 'normal');
                doc.setTextColor('#333333');
                
                const skillsText = cleanedSkills.join(',  ');
                const availableWidth = contentWidth - labelWidth;
                const lines = doc.splitTextToSize(skillsText, availableWidth);
                
                // First line after label
                doc.text(lines[0], margin + labelWidth, y);
                y += 16;
                
                // Remaining lines (indented to align)
                for (let i = 1; i < lines.length; i++) {
                    doc.text(lines[i], margin + labelWidth, y);
                    y += 15;
                }
            });
            
            y += 12;
        };
        
        // === EXPERIENCE ===
        const renderExperience = () => {
            if (!resumeData.experience?.length) return;
            
            addSectionHeader('EXPERIENCE');
            
            resumeData.experience.forEach((exp, i) => {
                checkPage(80);
                if (i > 0) y += 16;
                
                // Title
                doc.setFontSize(13);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor('#1a1a1a');
                doc.text(this.stripBold(exp.title), margin, y);
                
                // Dates
                if (exp.dates) {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(11);
                    doc.setTextColor('#666666');
                    doc.text(exp.dates, pageWidth - margin, y, { align: 'right' });
                }
                y += 16;
                
                // Company
                doc.setFontSize(12);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor('#444444');
                const companyLine = this.stripBold(exp.company) + (exp.location ? '  •  ' + exp.location : '');
                doc.text(companyLine, margin, y);
                y += 17;
                
                // Bullets with bold support
                exp.bullets?.forEach(bullet => {
                    checkPage(30);
                    doc.setFontSize(11);
                    doc.setTextColor('#333333');
                    doc.setFont('helvetica', 'normal');
                    doc.text('•', margin + 8, y);
                    
                    const lines = this.renderText(doc, bullet, margin + 22, y, 11, contentWidth - 25);
                    y += lines * 15 + 3;
                });
            });
            y += 12;
        };
        
        // === PROJECTS ===
        const renderProjects = () => {
            if (!resumeData.projects?.length) return;
            
            addSectionHeader('PROJECTS');
            
            resumeData.projects.forEach((proj, i) => {
                checkPage(70);
                if (i > 0) y += 14;
                
                // Name
                doc.setFontSize(13);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor('#1a1a1a');
                doc.text(this.stripBold(proj.name), margin, y);
                
                // Tech stack
                if (proj.technologies) {
                    const nameWidth = doc.getTextWidth(this.stripBold(proj.name));
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(11);
                    doc.setTextColor('#666666');
                    doc.text('   |   ' + this.stripBold(proj.technologies), margin + nameWidth, y);
                }
                y += 16;
                
                // Link
                if (proj.link && options.links) {
                    doc.setFontSize(10);
                    doc.setTextColor('#0066cc');
                    doc.setFont('helvetica', 'normal');
                    doc.text(proj.link, margin, y);
                    y += 14;
                }
                
                // Bullets with bold support
                proj.bullets?.forEach(bullet => {
                    checkPage(25);
                    doc.setFontSize(11);
                    doc.setTextColor('#333333');
                    doc.setFont('helvetica', 'normal');
                    doc.text('•', margin + 8, y);
                    
                    const lines = this.renderText(doc, bullet, margin + 22, y, 11, contentWidth - 25);
                    y += lines * 15 + 3;
                });
            });
            y += 12;
        };
        
        // === EDUCATION ===
        const renderEducation = () => {
            if (!resumeData.education?.length) return;
            
            addSectionHeader('EDUCATION');
            
            resumeData.education.forEach((edu, i) => {
                checkPage(50);
                if (i > 0) y += 12;
                
                // Degree
                doc.setFontSize(13);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor('#1a1a1a');
                doc.text(this.stripBold(edu.degree), margin, y);
                
                // Year
                if (edu.year) {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(11);
                    doc.setTextColor('#666666');
                    doc.text(edu.year, pageWidth - margin, y, { align: 'right' });
                }
                y += 16;
                
                // Institution + GPA
                doc.setFontSize(12);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor('#444444');
                let line = this.stripBold(edu.institution);
                if (edu.gpa) line += '   |   GPA: ' + edu.gpa;
                doc.text(line, margin, y);
                y += 15;
                
                // Coursework
                if (edu.coursework && options.coursework) {
                    doc.setFontSize(11);
                    doc.setTextColor('#555555');
                    const cwText = 'Relevant Coursework: ' + this.stripBold(edu.coursework);
                    const lines = doc.splitTextToSize(cwText, contentWidth);
                    doc.text(lines, margin, y);
                    y += lines.length * 14 + 4;
                }
            });
        };
        
        // Render sections in user-defined order
        const sectionMap = {
            skills: renderSkills,
            experience: renderExperience,
            projects: renderProjects,
            education: renderEducation
        };
        
        options.sections.forEach(sec => {
            if (sectionMap[sec]) sectionMap[sec]();
        });
        
        return doc;
    },
    
    createCoverLetter(personalInfo, data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'pt', format: 'letter' });
        
        const margin = 65;
        const contentWidth = 612 - (margin * 2);
        let y = 65;
        
        // Name
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#1a1a1a');
        doc.text(personalInfo.fullName || 'Your Name', margin, y);
        y += 22;
        
        // Contact
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#555555');
        const contact = [personalInfo.email, personalInfo.phone].filter(Boolean).join('   |   ');
        doc.text(contact, margin, y);
        y += 40;
        
        // Date
        doc.setFontSize(12);
        doc.setTextColor('#333333');
        doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), margin, y);
        y += 28;
        
        // Recipient
        doc.text('Hiring Manager', margin, y);
        y += 16;
        doc.text(this.stripBold(data.companyName || ''), margin, y);
        y += 32;
        
        // Greeting
        doc.text(this.stripBold(data.greeting || 'Dear Hiring Manager,'), margin, y);
        y += 28;
        
        // Body paragraphs with bold support
        data.paragraphs?.forEach(p => {
            const lines = this.renderText(doc, p, margin, y, 12, contentWidth);
            y += lines * 17 + 18;
        });
        
        // Closing
        y += 12;
        doc.setFont('helvetica', 'normal');
        doc.text(this.stripBold(data.closing || 'Sincerely,'), margin, y);
        y += 35;
        doc.setFont('helvetica', 'bold');
        doc.text(this.stripBold(data.signature || personalInfo.fullName || ''), margin, y);
        
        return doc;
    },
    
    download(doc, filename) {
        doc.save(filename);
    }
};
