import { JsonObject, JsonProperty, JsonConverter, JsonCustomConvert } from "json2typescript";

@JsonObject('WebhookModel')
export class WebhookModel {
    @JsonProperty("name", String,true)
    name: string = '';
    @JsonProperty("id", String,true)
    resourceUrl: string = '';
    @JsonProperty("platformTypeId", Number,true)
    platformTypeId: number = 1;
    @JsonProperty("lastUpdated", String,true)
    lastUpdated: string = '';
    @JsonProperty("entityName", String,true)
    entityName: string = '';
    @JsonProperty("entityId", String,true)
    entityId: string = '';
    @JsonProperty("operation", String,true)
    operation: string = '';
    @JsonProperty("notificationTime", String,true)
    notificationTime: string = '';
    @JsonProperty("platformBusinessId", String,true)
    platformBusinessId: string = '';
}
