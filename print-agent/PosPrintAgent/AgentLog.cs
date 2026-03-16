using System.Text;

namespace PosPrintAgent;

public static class AgentLog
{
    private static readonly object Gate = new();

    public static void Info(string message) => Write("INFO", message);
    public static void Warn(string message) => Write("WARN", message);
    public static void Error(string message) => Write("ERROR", message);

    public static void Error(Exception ex, string message)
    {
        var sb = new StringBuilder();
        sb.AppendLine(message);
        sb.AppendLine(ex.ToString());
        Write("ERROR", sb.ToString().TrimEnd());
    }

    private static void Write(string level, string message)
    {
        try
        {
            var path = Path.Combine(AppContext.BaseDirectory, "agent.log");
            var line = $"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {level}: {message}{Environment.NewLine}";
            lock (Gate)
            {
                File.AppendAllText(path, line, Encoding.UTF8);
            }
        }
        catch
        {
        }
    }
}

