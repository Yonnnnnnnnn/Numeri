import pdfplumber

pdf_path = r'd:\Numeri\Lablab_wxo-agentic-ai-hackathon-guide-nov-2025_copy.pdf'

with pdfplumber.open(pdf_path) as pdf:
    full_text = ""
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            full_text += text + "\n\n"
    
    print(full_text)
