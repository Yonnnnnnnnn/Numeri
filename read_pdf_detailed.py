import pdfplumber

pdf_path = r'd:\Numeri\Lablab_wxo-agentic-ai-hackathon-guide-nov-2025_copy.pdf'

with pdfplumber.open(pdf_path) as pdf:
    full_text = ""
    for i, page in enumerate(pdf.pages):
        text = page.extract_text()
        if text:
            full_text += f"\n\n===== PAGE {i+1} =====\n\n"
            full_text += text
    
    # Save to file for easier reading
    with open('pdf_content.txt', 'w', encoding='utf-8') as f:
        f.write(full_text)
    
    print("PDF content saved to pdf_content.txt")
    
    # Search for API-related content
    keywords = ['API', 'api key', 'endpoint', 'URL', 'credentials', 'authentication', 'token', 'project id', 'region']
    
    print("\n\n=== SEARCHING FOR API-RELATED CONTENT ===\n")
    
    lines = full_text.split('\n')
    for i, line in enumerate(lines):
        for keyword in keywords:
            if keyword.lower() in line.lower():
                # Print context (3 lines before and after)
                start = max(0, i-2)
                end = min(len(lines), i+3)
                context = '\n'.join(lines[start:end])
                print(f"\n--- Found '{keyword}' ---")
                print(context)
                print("---")
                break
