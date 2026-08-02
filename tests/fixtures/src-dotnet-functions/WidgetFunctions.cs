// Synthetic fixture. Two HTTP triggers plus one timer trigger that must NOT become a request.
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Text.Json.Serialization;

namespace Widgets;

public class CreateWidgetRequest
{
    [JsonPropertyName("widget_name")]
    public string WidgetName { get; set; } = "bolt";
    public int Quantity { get; set; } = 12;
}

public class WidgetFunctions
{
    /// <summary>Fetch one widget by its identifier.</summary>
    [Function("GetWidget")]
    public async Task<HttpResponseData> GetWidget(
        [HttpTrigger(AuthorizationLevel.Function, "get", Route = "widgets/{id}")] HttpRequestData req,
        string id)
    {
        var country = req.Query["country"];
        return req.CreateResponse();
    }

    /// <summary>Create a widget.</summary>
    [Function(nameof(CreateWidget))]
    public async Task<HttpResponseData> CreateWidget(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "widgets")] HttpRequestData req)
    {
        var body = await req.ReadFromJsonAsync<CreateWidgetRequest>();
        return req.CreateResponse();
    }

    // Not an HTTP endpoint. Must be reported as a skipped trigger, never emitted.
    [Function("NightlySync")]
    public void NightlySync([TimerTrigger("0 0 2 * * *")] TimerInfo timer) { }
}
