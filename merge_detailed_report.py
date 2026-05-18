import os

part1_path = r'd:\NEURALPATH\Report_Detailed_Part1.md'
part2_path = r'd:\NEURALPATH\Report_Detailed_Part2.md'
part3_path = r'd:\NEURALPATH\Report_Detailed_Part3.md'
output_path = r'd:\NEURALPATH\Scope_and_Hope_Final_Report_Detailed.md'

img1 = r'C:\Users\srotr\.gemini\antigravity\brain\21ee5084-5bda-4c0e-9ef8-16e4771edfdf\system_architecture_1777303425415.png'
img2 = r'C:\Users\srotr\.gemini\antigravity\brain\21ee5084-5bda-4c0e-9ef8-16e4771edfdf\resume_parsing_pipeline_1777303442979.png'
img3 = r'C:\Users\srotr\.gemini\antigravity\brain\21ee5084-5bda-4c0e-9ef8-16e4771edfdf\dashboard_ui_mockup_1777303459679.png'

with open(part1_path, 'r', encoding='utf-8') as f:
    part1 = f.read()
with open(part2_path, 'r', encoding='utf-8') as f:
    part2 = f.read()
with open(part3_path, 'r', encoding='utf-8') as f:
    part3 = f.read()

# Insert images
# System Architecture goes under 4.3
part2 = part2.replace('### 4.3 System Architecture', f'### 4.3 System Architecture\n\n![System Architecture Diagram]({img1})\n')

# Resume Parsing Pipeline goes under 4.4 Step 2
part2 = part2.replace('**Step 2 – Resume Upload (PDF/DOCX via pdfplumber):**', f'**Step 2 – Resume Upload (PDF/DOCX via pdfplumber):**\n\n![Resume Parsing Pipeline]({img2})\n')

# Dashboard UI goes under 4.4 Step 9 or 7.6
part3 = part3.replace('### 7.6 Feature 6: AI Career Guidance Chatbot', f'![Dashboard UI Mockup]({img3})\n\n### 7.6 Feature 6: AI Career Guidance Chatbot')

final_content = part1 + '\n\n' + part2 + '\n\n' + part3

with open(output_path, 'w', encoding='utf-8') as f:
    f.write(final_content)

print("Detailed report merged successfully!")
