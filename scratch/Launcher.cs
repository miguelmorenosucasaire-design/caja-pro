using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Threading;
using System.Windows.Forms;

namespace EduCajaLauncher
{
    static class Program
    {
        private static NotifyIcon trayIcon;
        private static Process serverProcess;
        private static ContextMenu trayMenu;

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            Directory.SetCurrentDirectory(baseDir);

            // 1. Iniciar servidor backend si no está activo
            EnsureServerRunning(baseDir);

            // 2. Abrir ventana de la aplicación de escritorio en modo App
            LaunchAppWindow("http://127.0.0.1:5000");

            // 3. Configurar icono en la bandeja del sistema (System Tray)
            SetupTrayIcon(baseDir);

            Application.Run();
        }

        static void EnsureServerRunning(string baseDir)
        {
            if (IsServerAlive("http://127.0.0.1:5000")) return;

            string exeBackend = Path.Combine(baseDir, "EduCaja_Pro.exe");
            ProcessStartInfo psi = new ProcessStartInfo();

            if (File.Exists(exeBackend))
            {
                psi.FileName = exeBackend;
            }
            else
            {
                psi.FileName = "node.exe";
                psi.Arguments = "server.js";
            }

            psi.WorkingDirectory = baseDir;
            psi.CreateNoWindow = true;
            psi.UseShellExecute = false;
            psi.WindowStyle = ProcessWindowStyle.Hidden;

            try
            {
                serverProcess = Process.Start(psi);
            }
            catch (Exception ex)
            {
                MessageBox.Show("No se pudo iniciar el servicio de EduCaja Pro:\n" + ex.Message, "EduCaja Pro - CETPRO San Miguel", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            // Esperar que el servidor responda (hasta 15 segundos)
            for (int i = 0; i < 30; i++)
            {
                Thread.Sleep(500);
                if (IsServerAlive("http://127.0.0.1:5000")) break;
            }
        }

        static bool IsServerAlive(string url)
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url + "/api/stats");
                req.Timeout = 800;
                using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
                {
                    return resp.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        public static void LaunchAppWindow(string url)
        {
            try
            {
                // Intentar Microsoft Edge en modo aplicación nativa
                Process.Start("msedge.exe", "--app=\"" + url + "\" --window-size=1300,850");
            }
            catch
            {
                try
                {
                    // Fallback a Google Chrome en modo aplicación
                    Process.Start("chrome.exe", "--app=\"" + url + "\" --window-size=1300,850");
                }
                catch
                {
                    // Fallback a navegador predeterminado
                    Process.Start(url);
                }
            }
        }

        static void SetupTrayIcon(string baseDir)
        {
            trayMenu = new ContextMenu();
            trayMenu.MenuItems.Add("Abrir EduCaja Pro", (s, e) => LaunchAppWindow("http://127.0.0.1:5000"));
            trayMenu.MenuItems.Add("Reiniciar Servidor", (s, e) => {
                try {
                    if (serverProcess != null && !serverProcess.HasExited) serverProcess.Kill();
                } catch {}
                EnsureServerRunning(baseDir);
                LaunchAppWindow("http://127.0.0.1:5000");
            });
            trayMenu.MenuItems.Add("-");
            trayMenu.MenuItems.Add("Salir del Programa", (s, e) => {
                try {
                    if (serverProcess != null && !serverProcess.HasExited) serverProcess.Kill();
                } catch {}
                trayIcon.Visible = false;
                Application.Exit();
            });

            trayIcon = new NotifyIcon();
            trayIcon.Text = "EduCaja Pro - CETPRO San Miguel";

            string icoPath = Path.Combine(baseDir, "app.ico");
            if (File.Exists(icoPath))
            {
                try { trayIcon.Icon = new Icon(icoPath); } catch {}
            }
            if (trayIcon.Icon == null)
            {
                trayIcon.Icon = SystemIcons.Application;
            }

            trayIcon.ContextMenu = trayMenu;
            trayIcon.Visible = true;
            trayIcon.DoubleClick += (s, e) => LaunchAppWindow("http://127.0.0.1:5000");
        }
    }
}
