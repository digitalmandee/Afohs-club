using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Hosting.WindowsServices;
using Microsoft.Extensions.Logging;

namespace PosPrintAgent;

public static class Program
{
    public static async Task<int> Main(string[] args)
    {
        try
        {
            var baseDir = AppContext.BaseDirectory;
            var configuration = new ConfigurationBuilder()
                .SetBasePath(baseDir)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .Build();

            var options = new AgentOptions();
            configuration.Bind(options);

            if (string.IsNullOrWhiteSpace(options.ServerUrl) || string.IsNullOrWhiteSpace(options.DeviceId) || string.IsNullOrWhiteSpace(options.ApiToken))
            {
                Console.Error.WriteLine("Invalid appsettings.json. serverUrl, deviceId, apiToken are required.");
                PauseBeforeExit();
                return 1;
            }

            var host = Host.CreateDefaultBuilder(args)
                .UseContentRoot(baseDir)
                .UseWindowsService()
                .ConfigureAppConfiguration(cfg =>
                {
                    cfg.SetBasePath(baseDir);
                    cfg.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
                })
                .ConfigureServices(services =>
                {
                    services.AddSingleton(options);
                    services.AddSingleton(_ => new HttpClient { Timeout = TimeSpan.FromSeconds(30) });
                    services.AddSingleton(sp => new PrintJobApi(sp.GetRequiredService<HttpClient>(), options));
                    services.AddHostedService<AgentWorker>();
                })
                .ConfigureLogging(logging =>
                {
                    if (WindowsServiceHelpers.IsWindowsService())
                    {
                        logging.ClearProviders();
                    }
                })
                .Build();

            if (!WindowsServiceHelpers.IsWindowsService())
            {
                Console.WriteLine("POS Print Agent started");
                Console.WriteLine("serverUrl: " + options.ServerUrl.TrimEnd('/'));
                Console.WriteLine("deviceId: " + options.DeviceId);
            }

            await host.RunAsync();
            return 0;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine("Fatal error:");
            Console.Error.WriteLine(ex.ToString());
            PauseBeforeExit();
            return 1;
        }
    }

    private static void PauseBeforeExit()
    {
        Console.WriteLine();
        Console.WriteLine("Press Enter to close...");
        try
        {
            Console.ReadLine();
        }
        catch
        {
        }
    }
}
