import { SzEntityNetworkResponse, SzEntityNetworkData  } from '@senzing/rest-api-client-ng';

export interface SzNetworkGraphInputs {
  data: SzEntityNetworkData;
  showLinkLabels: boolean;
}
