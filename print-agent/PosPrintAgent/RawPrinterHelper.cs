using System.Runtime.InteropServices;
using System.Text;

namespace PosPrintAgent;

public static class RawPrinterHelper
{
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
    private class DOCINFOA
    {
        [MarshalAs(UnmanagedType.LPStr)]
        public string pDocName = string.Empty;
        [MarshalAs(UnmanagedType.LPStr)]
        public string pOutputFile = string.Empty;
        [MarshalAs(UnmanagedType.LPStr)]
        public string pDataType = "RAW";
    }

    [DllImport("winspool.Drv", EntryPoint = "OpenPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true)]
    private static extern bool OpenPrinter(string szPrinter, out nint hPrinter, nint pd);

    [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true, ExactSpelling = true)]
    private static extern bool ClosePrinter(nint hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "StartDocPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true)]
    private static extern bool StartDocPrinter(nint hPrinter, int level, [In] DOCINFOA di);

    [DllImport("winspool.Drv", EntryPoint = "EndDocPrinter", SetLastError = true, ExactSpelling = true)]
    private static extern bool EndDocPrinter(nint hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "StartPagePrinter", SetLastError = true, ExactSpelling = true)]
    private static extern bool StartPagePrinter(nint hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "EndPagePrinter", SetLastError = true, ExactSpelling = true)]
    private static extern bool EndPagePrinter(nint hPrinter);

    [DllImport("winspool.Drv", EntryPoint = "WritePrinter", SetLastError = true, ExactSpelling = true)]
    private static extern bool WritePrinter(nint hPrinter, nint pBytes, int dwCount, out int dwWritten);

    public static void SendUtf8StringToPrinter(string printerName, string documentName, string content)
    {
        var bytes = Encoding.UTF8.GetBytes(content);
        SendBytesToPrinter(printerName, documentName, bytes);
    }

    public static void SendBytesToPrinter(string printerName, string documentName, byte[] bytes)
    {
        if (!OpenPrinter(printerName, out var hPrinter, nint.Zero))
        {
            throw new InvalidOperationException("OpenPrinter failed. Printer: " + printerName);
        }

        try
        {
            var di = new DOCINFOA { pDocName = documentName, pDataType = "RAW" };
            if (!StartDocPrinter(hPrinter, 1, di))
            {
                throw new InvalidOperationException("StartDocPrinter failed.");
            }

            try
            {
                if (!StartPagePrinter(hPrinter))
                {
                    throw new InvalidOperationException("StartPagePrinter failed.");
                }

                try
                {
                    var unmanagedBytes = Marshal.AllocCoTaskMem(bytes.Length);
                    try
                    {
                        Marshal.Copy(bytes, 0, unmanagedBytes, bytes.Length);
                        if (!WritePrinter(hPrinter, unmanagedBytes, bytes.Length, out _))
                        {
                            throw new InvalidOperationException("WritePrinter failed.");
                        }
                    }
                    finally
                    {
                        Marshal.FreeCoTaskMem(unmanagedBytes);
                    }
                }
                finally
                {
                    EndPagePrinter(hPrinter);
                }
            }
            finally
            {
                EndDocPrinter(hPrinter);
            }
        }
        finally
        {
            ClosePrinter(hPrinter);
        }
    }
}

