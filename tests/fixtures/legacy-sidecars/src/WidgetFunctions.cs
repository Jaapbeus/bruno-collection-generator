// Synthetic fixture. Not a real project.
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

namespace Fixture.Widgets;

public class WidgetFunctions
{
    /// <summary>Create a widget.</summary>
    [Function("CreateWidget")]
    public async Task<HttpResponseData> CreateWidget(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "widgets")] HttpRequestData req)
    {
        var body = await req.ReadFromJsonAsync<CreateWidgetRequest>();
        return req.CreateResponse(System.Net.HttpStatusCode.Created);
    }
}

public class CreateWidgetRequest
{
    public string WidgetName { get; set; } = "bolt";
    public int Quantity { get; set; } = 1;
}
