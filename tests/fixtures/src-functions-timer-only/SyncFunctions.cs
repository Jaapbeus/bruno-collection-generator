// Synthetic fixture: a Functions app with no HTTP surface at all.
// This must exit 3 ("a surface, none of it supported"), never 2 ("nothing found").
using Microsoft.Azure.Functions.Worker;

namespace SyncOnly;

public class SyncFunctions
{
    [Function("NightlySync")]
    public void NightlySync([TimerTrigger("0 0 2 * * *")] TimerInfo timer) { }

    [Function("HandleMessage")]
    public void HandleMessage([ServiceBusTrigger("widgets", Connection = "Bus")] string message) { }
}
