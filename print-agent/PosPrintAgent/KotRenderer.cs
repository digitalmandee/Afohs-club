using System.Text;
using System.Text.Json;

namespace PosPrintAgent;

public static class KotRenderer
{
    public static string RenderKot(JsonElement payload)
    {
        var sb = new StringBuilder();

        var orderId = TryGetString(payload, "order_id");
        var tableNo = TryGetString(payload, "table_no");
        var categoryName = TryGetString(payload, "category_name");
        var restaurant = TryGetString(payload, "restaurant");
        var startDate = TryGetString(payload, "start_date");
        var startTime = TryGetString(payload, "start_time");
        var kitchenNote = TryGetString(payload, "kitchen_note");

        sb.AppendLine(restaurant ?? "");
        sb.AppendLine("KOT");
        sb.AppendLine("Category: " + (categoryName ?? "-"));
        sb.AppendLine("Order: " + (orderId ?? "-") + (string.IsNullOrWhiteSpace(tableNo) ? "" : $"  Table: {tableNo}"));
        if (!string.IsNullOrWhiteSpace(startDate) || !string.IsNullOrWhiteSpace(startTime))
        {
            sb.AppendLine("Time: " + ((startDate ?? "") + " " + (startTime ?? "")).Trim());
        }
        sb.AppendLine(new string('-', 32));

        if (payload.TryGetProperty("groups", out var groups) && groups.ValueKind == JsonValueKind.Array)
        {
            foreach (var group in groups.EnumerateArray())
            {
                var groupName = TryGetString(group, "category_name") ?? "-";
                sb.AppendLine("Category: " + groupName);

                if (group.TryGetProperty("items", out var groupItems) && groupItems.ValueKind == JsonValueKind.Array)
                {
                    foreach (var item in groupItems.EnumerateArray())
                    {
                        var name = TryGetString(item, "name") ?? "";
                        var qty = TryGetString(item, "quantity") ?? "1";
                        sb.AppendLine($"{qty} x {name}");

                        if (item.TryGetProperty("variants", out var vars) && vars.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var v in vars.EnumerateArray())
                            {
                                var vn = TryGetString(v, "name");
                                var vv = TryGetString(v, "value");
                                if (!string.IsNullOrWhiteSpace(vn) || !string.IsNullOrWhiteSpace(vv))
                                {
                                    sb.AppendLine("  - " + (vn ?? "") + ": " + (vv ?? ""));
                                }
                            }
                        }

                        var instructions = TryGetString(item, "instructions");
                        if (!string.IsNullOrWhiteSpace(instructions))
                        {
                            sb.AppendLine("  Note: " + instructions);
                        }
                    }
                }
                sb.AppendLine(new string('-', 32));
            }
        }
        else if (payload.TryGetProperty("items", out var items) && items.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in items.EnumerateArray())
            {
                var name = TryGetString(item, "name") ?? "";
                var qty = TryGetString(item, "quantity") ?? "1";
                sb.AppendLine($"{qty} x {name}");

                if (item.TryGetProperty("variants", out var vars) && vars.ValueKind == JsonValueKind.Array)
                {
                    foreach (var v in vars.EnumerateArray())
                    {
                        var vn = TryGetString(v, "name");
                        var vv = TryGetString(v, "value");
                        if (!string.IsNullOrWhiteSpace(vn) || !string.IsNullOrWhiteSpace(vv))
                        {
                            sb.AppendLine("  - " + (vn ?? "") + ": " + (vv ?? ""));
                        }
                    }
                }

                var instructions = TryGetString(item, "instructions");
                if (!string.IsNullOrWhiteSpace(instructions))
                {
                    sb.AppendLine("  Note: " + instructions);
                }
            }
        }

        sb.AppendLine(new string('-', 32));
        if (!string.IsNullOrWhiteSpace(kitchenNote))
        {
            sb.AppendLine("Kitchen Note: " + kitchenNote);
        }
        sb.AppendLine();
        sb.AppendLine();

        return sb.ToString();
    }

    private static string? TryGetString(JsonElement el, string prop)
    {
        if (!el.TryGetProperty(prop, out var v))
        {
            return null;
        }

        return v.ValueKind switch
        {
            JsonValueKind.String => v.GetString(),
            JsonValueKind.Number => v.TryGetInt64(out var l) ? l.ToString() : v.ToString(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            _ => v.ToString(),
        };
    }
}
