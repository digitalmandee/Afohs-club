using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace PosPrintAgent;

public sealed record PullResponse(string device_id, List<PullJob> jobs);

public sealed record PullJob(long id, string? printer_type, string? printer_name, JsonElement payload, string? created_at);

public sealed class PrintJobApi
{
    private readonly HttpClient _http;
    private readonly AgentOptions _opt;

    public PrintJobApi(HttpClient http, AgentOptions opt)
    {
        _http = http;
        _opt = opt;
    }

    public async Task<List<PullJob>> PullAsync(CancellationToken ct)
    {
        var baseUrl = _opt.ServerUrl.TrimEnd('/');
        var url = $"{baseUrl}/api/pos/print-jobs/pull?device_id={Uri.EscapeDataString(_opt.DeviceId)}&limit={_opt.PullLimit}";

        using var req = new HttpRequestMessage(HttpMethod.Get, url);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _opt.ApiToken);

        using var resp = await _http.SendAsync(req, ct);
        resp.EnsureSuccessStatusCode();

        var json = await resp.Content.ReadAsStringAsync(ct);
        var parsed = JsonSerializer.Deserialize<PullResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        return parsed?.jobs ?? [];
    }

    public async Task AckAsync(long id, string status, string? error, CancellationToken ct)
    {
        var baseUrl = _opt.ServerUrl.TrimEnd('/');
        var url = $"{baseUrl}/api/pos/print-jobs/{id}/ack";

        var payload = new Dictionary<string, object?>
        {
            ["device_id"] = _opt.DeviceId,
            ["status"] = status,
            ["error"] = error,
        };

        using var req = new HttpRequestMessage(HttpMethod.Post, url);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _opt.ApiToken);
        req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

        using var resp = await _http.SendAsync(req, ct);
        resp.EnsureSuccessStatusCode();
    }
}

