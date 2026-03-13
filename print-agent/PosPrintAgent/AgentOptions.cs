namespace PosPrintAgent;

public sealed class AgentOptions
{
    public string ServerUrl { get; set; } = string.Empty;
    public string DeviceId { get; set; } = string.Empty;
    public string ApiToken { get; set; } = string.Empty;
    public int PollIntervalSeconds { get; set; } = 2;
    public int PullLimit { get; set; } = 5;
}

