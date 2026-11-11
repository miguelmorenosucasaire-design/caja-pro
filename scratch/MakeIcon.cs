using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

class MakeIcon {
    static void Main() {
        string imgPath = Path.Combine("public", "img", "logo_institucion.jpg");
        if (!File.Exists(imgPath)) {
            Console.WriteLine("Image not found: " + imgPath);
            return;
        }

        using (Bitmap src = new Bitmap(imgPath)) {
            // Resize to standard 256x256, 48x48, 32x32
            int size = 256;
            using (Bitmap square = new Bitmap(size, size)) {
                using (Graphics g = Graphics.FromImage(square)) {
                    g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighQuality;
                    g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;
                    g.Clear(Color.Transparent);
                    g.DrawImage(src, 0, 0, size, size);
                }

                // Save as icon
                IntPtr hIcon = square.GetHicon();
                using (Icon ico = Icon.FromHandle(hIcon)) {
                    using (FileStream fs = new FileStream("app.ico", FileMode.Create)) {
                        ico.Save(fs);
                    }
                }
            }
        }
        Console.WriteLine("app.ico generated successfully!");
    }
}
