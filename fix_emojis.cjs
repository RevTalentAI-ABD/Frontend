const fs = require('fs');
let file = 'src/components/PageRecruitment.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{ Badge, Spinner, ErrorState, Toast, EmptyState, Avatar \} from "\.\/UI";/, 
'import { Badge, Spinner, ErrorState, Toast, EmptyState, Avatar } from "./UI";\nimport { Briefcase, X, CheckCircle, AlertTriangle, Calendar, User, FileText, Trash2, Bot, Users } from "lucide-react";');

content = content.replace(/⚠️/g, '');
content = content.replace(/❌/g, '');
content = content.replace(/✅/g, '');

content = content.replace(/🤖 AI Match Score:/g, '<Bot size={14} style={{ marginRight: 4 }} /> AI Match Score:');
content = content.replace(/🤖 AI Screening Summary/g, '<Bot size={18} style={{ marginRight: 6 }} /> AI Screening Summary');

content = content.replace(/📅 Scheduled Interview/g, '<Calendar size={14} style={{ marginRight: 4 }} /> Scheduled Interview');
content = content.replace(/📅 Schedule Interview/g, '<Calendar size={14} style={{ marginRight: 4 }} /> Schedule Interview');
content = content.replace(/📅/g, '<Calendar size={18} />');

content = content.replace(/👤/g, '<User size={12} style={{ marginRight: 4 }} />');
content = content.replace(/📄 View Resume/g, '<FileText size={14} style={{ marginRight: 4 }} /> View Resume');

content = content.replace(/✕ Reject/g, '<X size={14} style={{ marginRight: 4 }} /> Reject');
content = content.replace(/✕ Cancel/g, '<X size={14} style={{ marginRight: 4 }} /> Cancel');
content = content.replace(/✕/g, '<X size={18} />');

content = content.replace(/🗑/g, '<Trash2 size={14} />');
content = content.replace(/↩ Reconsider/g, '↺ Reconsider');
content = content.replace(/💼/g, '');
content = content.replace(/👥 View pipeline/g, '<Users size={14} style={{ marginRight: 4 }} /> View pipeline');
content = content.replace(/→/g, '');

fs.writeFileSync(file, content);
console.log('Fixed PageRecruitment.jsx');
