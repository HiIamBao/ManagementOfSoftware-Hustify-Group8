'use client'; 
import { useState } from "react"; 
import type { User } from "@/types"; 
export default function UserExperience({ user }: { user: User }) { 
const [experiences, setExperiences] = useState<string[]>(user.experiences || []); 
const [editing, setEditing] = useState(false); 
const [textarea, setTextarea] = useState(experiences.join('\n')); 
// Lưu kinh nghiệm mới 
const handleSave = async () => { 
const newExperiences = textarea 
.split('\n') 
.map(s => s.trim()) 
.filter(s => s); 
setExperiences(newExperiences); 
setEditing(false); 
// Gọi API lưu experiences mới lên Firestore 
await fetch("/api/user/update", { 
method: "POST", 
headers: { "Content-Type": "application/json" }, 
body: JSON.stringify({ id: user.id, experiences: newExperiences }), 
}); 
}; 
return ( 
<article className="card-interview flex items-start gap-4 w-full p-4 border-black dark:border-white relative" 
style={{ borderWidth: '1.5px' }}> 
{/* Nút Edit ở góc phải trên, chỉ hiện khi đã có experience và không editing */} 
{!editing && experiences.length > 0 && ( 
<button 
className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-black hover:bg-gray-100 transition shadow" 
onClick={() => setEditing(true)} 
title="Edit experience" 
> 
<svg width={20} height={20} viewBox="0 0 24 24" fill="#BF3131"> 
<path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/> 
</svg> 
</button> 
)} 
<div className="flex-1 w-full"> 
<h3 className="font-bold text-lg mb-4">Experience</h3> 
{!editing ? ( 
<> 
{experiences.length === 0 ? ( 
<> 
<p className="text-base text-gray-400 mb-4 italic"> 
Showcase your achievements and get 2x more profile views and connections. 
</p> 
<button 
className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-sm bg-white hover:bg-[#FFCCCC] transition dark:bg-[#bf3131] dark:text-white dark:border-white 
dark:hover:bg-[#d14343]" 
style={{ borderWidth: 1.5 }} 
onClick={() => setEditing(true)} 
> 
Add Experience 
</button> 
</> 
) : ( 
<> 
<ul className="list-disc pl-4 mb-4"> 
{experiences.map((exp, idx) => ( 
<li key={idx} className="text-black dark:text-white">{exp}</li> 
))} 
</ul> 
</> 
)} 
</> 
) : ( 
<div className="flex flex-col gap-2 w-full"> 
<textarea 
className="input input-bordered p-2 min-h-[100px] w-full" 
value={textarea} 
onChange={e => setTextarea(e.target.value)} 
placeholder="Nhập mỗi kinh nghiệm trên một dòng..." 
autoFocus 
/> 
<div className="flex gap-2"> 
<button 
className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#626f47] text-[#626f47] font-semibold text-sm bg-white hover:bg-[#e4ffdb] transition dark:bg-[#626f47] dark:text-white dark:border-white 
dark:hover:bg-[#4a5634]" 
style={{ borderWidth: 1.5 }} 
onClick={handleSave} 
> 
Save 
</button> 
<button 
className="flex items-center gap-1 px-3 py-1 rounded-full border border-[#BF3131] text-[#BF3131] font-semibold text-sm bg-white hover:bg-[#FFCCCC] transition dark:bg-[#bf3131] dark:text-white dark:border-white 
dark:hover:bg-[#d14343]" 
style={{ borderWidth: 1.5 }} 
onClick={() => setEditing(false)} 
> 
Cancel 
</button> 
</div> 
</div> 
)} 
</div> 
</article> 
); 
} 

