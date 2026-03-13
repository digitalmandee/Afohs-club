using System.Net.Sockets;
using System.Text;

namespace PosPrintAgent;

public static class KotPrinter
{
    public static async Task PrintAsync(string printerType, string printerNameOrHost, string content, CancellationToken ct)
    {
        var type = (printerType ?? "windows").Trim();
        var dest = (printerNameOrHost ?? "").Trim();
        if (dest == "")
        {
            throw new InvalidOperationException("Missing printer_name");
        }

        if (type == "network_9100")
        {
            await PrintToNetwork9100(dest, content, ct);
            return;
        }

        RawPrinterHelper.SendUtf8StringToPrinter(dest, "KOT", content);
    }

    private static async Task PrintToNetwork9100(string printerNameOrHost, string content, CancellationToken ct)
    {
        var host = printerNameOrHost;
        var port = 9100;
        if (printerNameOrHost.Contains(':'))
        {
            var parts = printerNameOrHost.Split(':', 2);
            host = parts[0];
            if (int.TryParse(parts[1], out var p))
            {
                port = p;
            }
        }

        using var client = new TcpClient();
        await client.ConnectAsync(host, port, ct);
        var bytes = Encoding.UTF8.GetBytes(content);
        await using var stream = client.GetStream();
        await stream.WriteAsync(bytes, ct);
        await stream.FlushAsync(ct);
    }
}

