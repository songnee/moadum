import Cocoa

let srcPath = "/Users/bella.mirae/.gemini/antigravity/brain/b894d1ce-6aef-40f2-913b-2a4eb118f454/.user_uploaded/media_1793927493815_e6faab10.jpg"
let outDir = "/Users/bella.mirae/.gemini/antigravity/scratch/moadum/assets"
try? FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)

guard let img = NSImage(contentsOfFile: srcPath),
      let cgImg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    print("Failed to load source image")
    exit(1)
}

let width = cgImg.width
let height = cgImg.height
print("Source image size: \(width)x\(height)")

func saveCrop(rect: CGRect, filename: String) {
    guard let cropped = cgImg.cropping(to: rect) else {
        print("Failed to crop \(filename)")
        return
    }
    let rep = NSBitmapImageRep(cgImage: cropped)
    guard let data = rep.representation(using: .png, properties: [:]) else { return }
    let outPath = "\(outDir)/\(filename)"
    try? data.write(to: URL(fileURLWithPath: outPath))
    print("Saved \(filename) (\(cropped.width)x\(cropped.height))")
}

// Total size: 1024 x 682
// 1. Otter meme image (bottom-left area in the quick save dialog)
// In bottom-left (x: 0~512, y: 341~682 in standard top-left coords, but CGImage is inverted or normal depending on coords)
// Let's test cropping otter meme around x: 220~340, y: 500~600
// Note: CGImage(0,0) is TOP-LEFT in macOS cropping!
// Top-left quad: 0..512 x 0..341
// Top-right quad: 512..1024 x 0..341
// Bottom-left quad: 0..512 x 341..682
// Bottom-right quad: 512..1024 x 341..682

// Otter meme: In bottom-left quad, x is roughly 220 to 345, y is roughly 500 to 600
saveCrop(rect: CGRect(x: 218, y: 500, width: 130, height: 95), filename: "otter_meme.png")

// Cat mascot from top-left quad: roughly x: 385 to 455, y: 150 to 225
saveCrop(rect: CGRect(x: 395, y: 150, width: 65, height: 70), filename: "cat_mascot.png")

// Profile avatar from header: roughly x: 440 to 455, y: 40 to 58
saveCrop(rect: CGRect(x: 438, y: 40, width: 22, height: 22), filename: "avatar.png")

// Book image from top-left: x: 240 to 355, y: 345 is bottom of card... let's see:
// Recent card 2 (Book): x: 240 to 355, y: 240 to 300
saveCrop(rect: CGRect(x: 240, y: 236, width: 114, height: 64), filename: "book_thumb.png")

// Recent card 3 (Otter preview in top-left): x: 366 to 478, y: 236 to 300
saveCrop(rect: CGRect(x: 366, y: 236, width: 114, height: 64), filename: "otter_thumb.png")

// Study laptop from top-right: x: 790 to 865, y: 425 to 475
saveCrop(rect: CGRect(x: 792, y: 425, width: 75, height: 42), filename: "study_thumb.png")

print("Crop finished")
