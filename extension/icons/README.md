# Icon Generation

The SVG file `icon.svg` is the master icon file.

## Converting to PNG

To convert the SVG to PNG files, you can use one of the following methods:

### Method 1: Online Converter
1. Visit https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Set sizes: 16x16, 48x48, 128x128
4. Download and rename to icon16.png, icon48.png, icon128.png

### Method 2: Using ImageMagick (CLI)
```bash
convert -background none -density 300 icon.svg -resize 16x16 icon16.png
convert -background none -density 300 icon.svg -resize 48x48 icon48.png
convert -background none -density 300 icon.svg -resize 128x128 icon128.png
```

### Method 3: Using Inkscape
```bash
inkscape icon.svg --export-type=png --export-filename=icon16.png -w 16 -h 16
inkscape icon.svg --export-type=png --export-filename=icon48.png -w 48 -h 48
inkscape icon.svg --export-type=png --export-filename=icon128.png -w 128 -h 128
```

## Temporary Placeholder

For testing, you can use simple colored squares:
```bash
# Create simple placeholder icons
convert -size 16x16 xc:#1a1a1a icon16.png
convert -size 48x48 xc:#1a1a1a icon48.png
convert -size 128x128 xc:#1a1a1a icon128.png
```

Or use ImageMagick to add text:
```bash
convert -size 128x128 xc:#1a1a1a -gravity center -pointsize 48 -fill white -annotate 0 "AI" icon128.png
```
