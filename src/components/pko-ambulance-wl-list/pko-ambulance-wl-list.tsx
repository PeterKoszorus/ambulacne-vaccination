import {Component, Host, Event, h, EventEmitter, State, Prop} from '@stencil/core';
import {AmbulanceWaitingListApiFactory, WaitingListEntry} from "../../api/ambulance-wl";

@Component({
  tag: 'pko-ambulance-wl-list',
  styleUrl: 'pko-ambulance-wl-list.css',
  shadow: true,
})
export class PkoAmbulanceWlList {
  @Event({eventName: "entry-clicked"}) entryClicked: EventEmitter<string>;
  @Prop() apiBase: string;
  @Prop() ambulanceId: string;
  @State() errorMessage: string;

  waitingPatients: WaitingListEntry[];

  async componentWillLoad() {
    this.waitingPatients = await this.getWaitingPatientsAsync();
  }

  private async getWaitingPatientsAsync(): Promise<WaitingListEntry[]> {
    try {
      const response = await
        AmbulanceWaitingListApiFactory(undefined, this.apiBase).getWaitingListEntries(this.ambulanceId)
      if (response.status < 299) {
        return response.data;
      } else {
        this.errorMessage = `Cannot retrieve list of waiting patients: ${response.statusText}`
      }
    } catch (err: any) {
      this.errorMessage = `Cannot retrieve list of avaliable vaccinations patients: ${err.message || "unknown"}`
    }
    return [];
  }

  render() {
    return (
      <Host>
        {this.errorMessage
          ? <div class="error">{this.errorMessage}</div>
          :
          <md-list>
            {this.waitingPatients.map((patient) =>
              <md-list-item onClick={() => this.entryClicked.emit(patient.id)}>
                <div slot="headline">{patient.name}</div>
                <div
                  slot="supporting-text">{"Objednaný na vakcínu: " + patient.nameOfVaccine }</div>
                <md-icon slot="start">person</md-icon>
              </md-list-item>
            )}
          </md-list>
        }
        <md-filled-icon-button className="add-button"
                               onclick={() => this.entryClicked.emit("@new")}>
          <md-icon>add</md-icon>
        </md-filled-icon-button>
      </Host>
    );
  }

  private isoDateToLocale(iso: string) {
    if (!iso) return '';
    return new Date(Date.parse(iso)).toLocaleTimeString()
  }
}