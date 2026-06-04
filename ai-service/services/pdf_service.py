import io
import cloudinary.uploader
from playwright.async_api import async_playwright


async def generate_pdf(html_content: str, file_name: str) -> dict:
    """Render HTML to PDF with Playwright and upload the result to Cloudinary."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )
        page = await browser.new_page()
        await page.set_content(html_content, wait_until="networkidle")
        pdf_bytes = await page.pdf(
            format="A4",
            margin={"top": "20px", "right": "20px", "bottom": "20px", "left": "20px"},
            print_background=True,
        )
        await browser.close()

    result = cloudinary.uploader.upload(
        io.BytesIO(pdf_bytes),
        resource_type="image",
        folder="ai-office-pdfs",
        public_id=file_name,
        format="pdf",
    )
    return result
