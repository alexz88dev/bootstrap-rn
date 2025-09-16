import ExpoModulesCore
import VisionKit
import Vision

public class VisionKitScannerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("VisionKitScanner")
    
    AsyncFunction("scanText") { (promise: Promise) in
      DispatchQueue.main.async {
        guard VNDocumentCameraViewController.isSupported else {
          promise.reject("NOT_SUPPORTED", "Document scanning is not supported on this device")
          return
        }
        
        let scannerViewController = VNDocumentCameraViewController()
        let delegate = ScannerDelegate(promise: promise)
        scannerViewController.delegate = delegate
        
        // Store delegate to prevent deallocation
        objc_setAssociatedObject(scannerViewController, "delegate", delegate, .OBJC_ASSOCIATION_RETAIN)
        
        if let currentVC = UIApplication.shared.keyWindow?.rootViewController {
          currentVC.present(scannerViewController, animated: true)
        } else {
          promise.reject("NO_VIEW", "Could not present scanner")
        }
      }
    }
  }
}

class ScannerDelegate: NSObject, VNDocumentCameraViewControllerDelegate {
  let promise: Promise
  
  init(promise: Promise) {
    self.promise = promise
  }
  
  func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFinishWith scan: VNDocumentCameraScan) {
    controller.dismiss(animated: true)
    
    var allText = ""
    let recognizer = VNRecognizeTextRequest { request, error in
      guard error == nil else {
        self.promise.reject("OCR_ERROR", error?.localizedDescription ?? "Unknown error")
        return
      }
      
      guard let observations = request.results as? [VNRecognizedTextObservation] else {
        self.promise.reject("NO_TEXT", "No text found")
        return
      }
      
      for observation in observations {
        if let topCandidate = observation.topCandidates(1).first {
          allText += topCandidate.string + "\n"
        }
      }
    }
    
    recognizer.recognitionLevel = .accurate
    recognizer.recognitionLanguages = ["en-US"]
    recognizer.usesLanguageCorrection = true
    
    // Process all scanned pages
    for pageIndex in 0..<scan.pageCount {
      let image = scan.imageOfPage(at: pageIndex)
      guard let cgImage = image.cgImage else { continue }
      
      let requestHandler = VNImageRequestHandler(cgImage: cgImage)
      try? requestHandler.perform([recognizer])
    }
    
    promise.resolve([
      "text": allText,
      "pageCount": scan.pageCount
    ])
  }
  
  func documentCameraViewControllerDidCancel(_ controller: VNDocumentCameraViewController) {
    controller.dismiss(animated: true)
    promise.reject("CANCELLED", "User cancelled scanning")
  }
  
  func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFailWithError error: Error) {
    controller.dismiss(animated: true)
    promise.reject("SCAN_ERROR", error.localizedDescription)
  }
}
