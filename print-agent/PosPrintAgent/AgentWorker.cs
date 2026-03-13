using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace PosPrintAgent;

public sealed class AgentWorker : BackgroundService
{
    private readonly ILogger<AgentWorker> _logger;
    private readonly PrintJobApi _api;
    private readonly AgentOptions _opt;

    public AgentWorker(ILogger<AgentWorker> logger, PrintJobApi api, AgentOptions opt)
    {
        _logger = logger;
        _api = api;
        _opt = opt;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("POS Print Agent running. deviceId={deviceId} serverUrl={serverUrl}", _opt.DeviceId, _opt.ServerUrl);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var jobs = await _api.PullAsync(stoppingToken);
                if (jobs.Count > 0)
                {
                    foreach (var job in jobs)
                    {
                        await ProcessJob(job, stoppingToken);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Poll failed");
            }

            var delay = TimeSpan.FromSeconds(Math.Max(1, _opt.PollIntervalSeconds));
            try
            {
                await Task.Delay(delay, stoppingToken);
            }
            catch (TaskCanceledException)
            {
                break;
            }
        }
    }

    private async Task ProcessJob(PullJob job, CancellationToken ct)
    {
        try
        {
            var printerType = (job.printer_type ?? "windows").Trim();
            var printerName = (job.printer_name ?? "").Trim();

            var content = KotRenderer.RenderKot(job.payload);
            await KotPrinter.PrintAsync(printerType, printerName, content, ct);

            await _api.AckAsync(job.id, "printed", null, ct);
            _logger.LogInformation("Printed job {id} on {printerType}:{printerName}", job.id, printerType, printerName);
        }
        catch (Exception ex)
        {
            var err = ex.ToString();
            if (err.Length > 5000) err = err[..5000];
            try
            {
                await _api.AckAsync(job.id, "failed", err, ct);
            }
            catch
            {
            }
            _logger.LogError(ex, "Job {id} failed", job.id);
        }
    }
}

