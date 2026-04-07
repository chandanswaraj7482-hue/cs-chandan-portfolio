import re

def main():
    file_path = "index.html"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Fix image source paths /1.webp -> 1.webp
    content = re.sub(r'src="/(\d+\.webp)"', r'src="\1"', content)
    # Fix th1.webp and th2
    content = content.replace('src="/th1.webp"', 'src="th1.webp"')
    content = content.replace('src="/th2"', 'src="th2.webp"')

    # Fix undefined icon in buttons
    content = content.replace('<span class="icon"></span>', '<i class="ph ph-arrow-up-right"></i>')

    # Fix item 5: move button inside portfolio-content
    # By finding the end of portfolio-content and the button
    item5_pattern = r'(<div class="cs-item"><span class="cs-label lbl-sol">Solution:</span> Create a relatable,\s*scroll-stopping visual.</div>\s*</div>\s*</div>)(\s*<a href="https://www.instagram.com/p/DWdVJUFkxzx/\?igsh=MW5ta2NoMXZjODR1aw=="\s*class="live-project-btn" target="_blank">\s*View All Slide\s*<i class="ph ph-arrow-up-right"></i>\s*</a>)'
    
    # We want to put the anchor block before the last closing </div> of portfolio-content
    # The first group ends with </div> (case-study) then </div> (portfolio-content).
    # Wait, the exact text in item 5:
    """
                        </div>
                    </div>

                    <a href="https://www.instagram.com/p/DWdVJUFkxzx/?igsh=MW5ta2NoMXZjODR1aw=="
                        class="live-project-btn" target="_blank">
                        View All Slide
                        <i class="ph ph-arrow-up-right"></i>
                    </a>
                </div>
    """
    
    # Simple replace
    old_item5 = """                        </div>
                    </div>

                    <a href="https://www.instagram.com/p/DWdVJUFkxzx/?igsh=MW5ta2NoMXZjODR1aw=="
                        class="live-project-btn" target="_blank">
                        View All Slide
                        <i class="ph ph-arrow-up-right"></i>
                    </a>
                </div>"""
                
    new_item5 = """                        </div>
                        <a href="https://www.instagram.com/p/DWdVJUFkxzx/?igsh=MW5ta2NoMXZjODR1aw=="
                            class="live-project-btn" target="_blank" style="margin-top: 15px;">
                            View All Slide
                            <i class="ph ph-arrow-up-right"></i>
                        </a>
                    </div>
                </div>"""
                
    content = content.replace(old_item5, new_item5)

    # Fix item 5 text repeating goal and solution
    content = content.replace(
        '<div class="cs-item"><span class="cs-label lbl-sol">Solution:</span> Create a relatable,\n                                scroll-stopping visual.</div>',
        '<div class="cs-item"><span class="cs-label lbl-sol">Solution:</span> Implemented distinct visual hierarchy with bold typography and contrasting elements to instantly grab attention.</div>'
    )

    # Add the PRINT item right before <!-- ========== VIDEO EDITING (4) ========== --> or at the end of the grid
    # Let's see if there rests a <!-- ========== PRINT DESIGN ========== --> part.
    # Looking at the HTML, the categories were Ads, Thumbnails, Banners, Branding.
    # We can inject Print Design at the end of Branding.
    
    branding_end_tag = "<!-- ========== BANNERS (6) ========== -->" # just as an anchor
    # Wait, branding is after Banners. Let's find "<!-- ========== BRANDING (6) ========== -->" and insert Print block after it or at the very end of the grid.
    
    print_item = """
                <!-- ========== PRINT DESIGN ========== -->
                <div class="portfolio-item glass-card" data-cat="print">
                    <div class="portfolio-img-container"><img src="cover1.webp" alt="Space Explorer Workbook Cover" class="portfolio-img"></div>
                    <div class="portfolio-content">
                        <h3>Space Explorer Workbook</h3>
                        <div class="case-study">
                            <div class="cs-item"><span class="cs-label lbl-prob">Problem:</span> Educational workbooks often look dull and uninspiring for kids.</div>
                            <div class="cs-item"><span class="cs-label lbl-goal">Goal:</span> Create an engaging, vibrant cover that excites children about space learning.</div>
                            <div class="cs-item"><span class="cs-label lbl-sol">Solution:</span> Utilized playful illustrations, deep space colors, and bold fonts to make learning look like an adventure.</div>
                        </div>
                        <a href="https://learnwhatmatters.in/products/the-ultimate-space-explorer-workbook" class="live-project-btn" target="_blank" style="margin-top: 15px;">
                            View Live Project
                            <i class="ph ph-arrow-up-right"></i>
                        </a>
                    </div>
                </div>
"""
    # Insert it before the closing of portfolio-grid. We can find `<div class="portfolio-item ...` for the last element or simply replace the last closing div of portfolio grid.
    # Let's just find the last portfolio item and append it.
    # Actually, we can append it directly before `            </div>\n        </div>\n    </section>\n\n    <!-- Why Choose Me Section -->` (but wait, Why Choose Me is before Portfolio!)
    # Portfolio comes after Why Choose me.
    # Portfolio section ends with `</section>`
    # We will search for Portfolio section end:
    
    # Portfolio grid ends. Then </section>. There is another section maybe "Testimonials"
    
    content = content.replace('            </div>\n\n            <!-- ========== THUMBNAILS (6) ==========', '            </div>\n' + print_item + '\n            <!-- ========== THUMBNAILS (6) ==========')

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    main()
