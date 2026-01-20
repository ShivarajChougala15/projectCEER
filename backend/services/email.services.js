import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

// Send BOM request notification to guide
export const sendBOMRequestToGuide = async (guide, student, team, bom) => {
    try {
        const transporter = createTransporter();

        const materialsTable = bom.materials
            .map(
                (material, index) =>
                    `${index + 1}. ${material.name} - Quantity: ${material.quantity} ${material.unit} - Specifications: ${material.specifications || 'N/A'}`
            )
            .join('\n');

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: guide.email,
            subject: `New BOM Request from Team: ${team.teamName}`,
            html: `
        <h2>New Bill of Materials Request</h2>
        <p>Dear ${guide.name},</p>
        <p>You have received a new BOM request from your team.</p>
        
        <h3>Team Details:</h3>
        <ul>
          <li><strong>Team Name:</strong> ${team.teamName}</li>
          <li><strong>Project:</strong> ${team.projectTitle}</li>
          <li><strong>Submitted By:</strong> ${student.name} (${student.email})</li>
        </ul>
        
        <h3>Materials Requested:</h3>
        <pre>${materialsTable}</pre>
        
        <p>Please review and approve/reject this request at your earliest convenience.</p>
        
        <p>Best regards,<br/>Exploration Lab Management System</p>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log('BOM request email sent to guide');
    } catch (error) {
        console.error('Error sending email to guide:', error);
        throw error;
    }
};

// Send approval notification to student
export const sendApprovalToStudent = async (student, team, bom, approver, approverRole) => {
    try {
        const transporter = createTransporter();

        const materialsTable = bom.materials
            .map(
                (material, index) =>
                    `${index + 1}. ${material.name} - Quantity: ${material.quantity} ${material.unit} - Specifications: ${material.specifications || 'N/A'}`
            )
            .join('\n');

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: student.email,
            subject: `BOM Request Approved by ${approverRole}`,
            html: `
        <h2>BOM Request Approved</h2>
        <p>Dear ${student.name},</p>
        <p>Your BOM request has been approved by ${approver.name} (${approverRole}).</p>
        
        <h3>Team Details:</h3>
        <ul>
          <li><strong>Team Name:</strong> ${team.teamName}</li>
          <li><strong>Project:</strong> ${team.projectTitle}</li>
        </ul>
        
        <h3>Approved Materials:</h3>
        <pre>${materialsTable}</pre>
        
        ${bom.guideComments ? `<p><strong>Guide Comments:</strong> ${bom.guideComments}</p>` : ''}
        
        <p>Best regards,<br/>Exploration Lab Management System</p>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Approval email sent to student');
    } catch (error) {
        console.error('Error sending approval email:', error);
        throw error;
    }
};

// Send BOM to lab incharge after guide approval
export const sendBOMToLabIncharge = async (labIncharge, team, bom, guide) => {
    try {
        const transporter = createTransporter();

        const materialsTable = bom.materials
            .map(
                (material, index) =>
                    `${index + 1}. ${material.name} - Quantity: ${material.quantity} ${material.unit} - Specifications: ${material.specifications || 'N/A'}`
            )
            .join('\n');

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: labIncharge.email,
            subject: `Guide-Approved BOM from Team: ${team.teamName}`,
            html: `
        <h2>Guide-Approved BOM Request</h2>
        <p>Dear ${labIncharge.name},</p>
        <p>A BOM request has been approved by the guide and requires your review.</p>
        
        <h3>Team Details:</h3>
        <ul>
          <li><strong>Team Name:</strong> ${team.teamName}</li>
          <li><strong>Project:</strong> ${team.projectTitle}</li>
          <li><strong>Guide:</strong> ${guide.name}</li>
        </ul>
        
        <h3>Materials Requested:</h3>
        <pre>${materialsTable}</pre>
        
        ${bom.guideComments ? `<p><strong>Guide Comments:</strong> ${bom.guideComments}</p>` : ''}
        
        <p>Please review the inventory and approve/reject this request.</p>
        
        <p>Best regards,<br/>Exploration Lab Management System</p>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log('BOM email sent to lab incharge');
    } catch (error) {
        console.error('Error sending email to lab incharge:', error);
        throw error;
    }
};

// Send rejection notification
export const sendRejectionToStudent = async (student, team, bom, rejector, rejectorRole, comments) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: student.email,
            subject: `BOM Request Rejected by ${rejectorRole}`,
            html: `
        <h2>BOM Request Rejected</h2>
        <p>Dear ${student.name},</p>
        <p>Your BOM request has been rejected by ${rejector.name} (${rejectorRole}).</p>
        
        <h3>Team Details:</h3>
        <ul>
          <li><strong>Team Name:</strong> ${team.teamName}</li>
          <li><strong>Project:</strong> ${team.projectTitle}</li>
        </ul>
        
        ${comments ? `<p><strong>Reason:</strong> ${comments}</p>` : ''}
        
        <p>Please revise your BOM and submit again.</p>
        
        <p>Best regards,<br/>Exploration Lab Management System</p>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Rejection email sent to student');
    } catch (error) {
        console.error('Error sending rejection email:', error);
        throw error;
    }
};
