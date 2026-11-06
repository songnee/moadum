import Cocoa
import Vision

let wfDir = "/Users/bella.mirae/.gemini/antigravity/scratch/moadum/wireframes"
let fileManager = FileManager.default
let files = try! fileManager.contentsOfDirectory(atPath: wfDir).filter { $0.hasSuffix(".png") }.sorted()

for file in files {
    let url = URL(fileURLWithPath: "\(wfDir)/\(file)")
    print("=== FILE: \(file) ===")
    guard let image = NSImage(contentsOf: url),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        print("Failed to load \(file)")
        continue
    }
    let request = VNRecognizeTextRequest()
    request.recognitionLanguages = ["ko-KR", "en-US"]
    request.recognitionLevel = .accurate
    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    try? handler.perform([request])
    if let observations = request.results {
        for obs in observations {
            if let top = obs.topCandidates(1).first {
                print(top.string)
            }
        }
    }
    print("\n")
}
