import Cocoa

let srcPath = "/Users/bella.mirae/.gemini/antigravity/brain/b894d1ce-6aef-40f2-913b-2a4eb118f454/.user_uploaded/media_1793932844296_54e24347.jpg"
let outDir = "/Users/bella.mirae/.gemini/antigravity/scratch/moadum/assets"

guard let img = NSImage(contentsOfFile: srcPath),
      let cgImg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    print("Failed to load source image")
    exit(1)
}

func saveCrop(rect: CGRect, filename: String) {
    guard let cropped = cgImg.cropping(to: rect) else {
        print("Failed to crop \(filename)")
        return
    }
    let rep = NSBitmapImageRep(cgImage: cropped)
    guard let data = rep.representation(using: .jpeg, properties: [:]) else { return }
    let outPath = "\(outDir)/\(filename)"
    try? data.write(to: URL(fileURLWithPath: outPath))
    print("Saved \(filename) (\(cropped.width)x\(cropped.height))")
}

// 473 x 1024
saveCrop(rect: CGRect(x: 5, y: 378, width: 230, height: 180), filename: "meme_exhausted.jpg")
saveCrop(rect: CGRect(x: 238, y: 378, width: 230, height: 180), filename: "meme_take_me.jpg")
saveCrop(rect: CGRect(x: 5, y: 585, width: 230, height: 140), filename: "meme_hard_life.jpg")
saveCrop(rect: CGRect(x: 238, y: 598, width: 230, height: 180), filename: "meme_fall_love.jpg")
saveCrop(rect: CGRect(x: 5, y: 742, width: 230, height: 180), filename: "meme_menbung.jpg")

print("Meme crops complete!")
