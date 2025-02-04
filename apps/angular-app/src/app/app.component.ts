import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AfterViewInit, Component, inject, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SwPush } from '@angular/service-worker';

@Component({
  imports: [RouterModule, HttpClientModule],
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'angular-app';
  private readonly VAPID_PUBLIC_KEY =
    'BEpHQo8DZGEvUGintoD89LllZrucBK3ggpB1uiq1aJe0PAWx8xWkPrf6prR3noFlQE2LaZtJPMG_cs8sPVnYJ_0';
  private httpClient;
  private eventSource: any;
  constructor(private swPush: SwPush) {
    this.httpClient = inject(HttpClient);
  }
  ngAfterViewInit(): void {
    console.log();

    // this.requestSubscription();
  }
  ngOnDestroy(): void {
    this.eventSource.close();
  }
  /**
   * requestSSE
   */
  public requestSSE() {
    this.eventSource = new EventSource('/api/sse');
    this.eventSource.onmessage = ({ data }: any) => {
      console.log('New message', JSON.parse(data));
    };
  }

  public requestSubscription() {
    if (!this.swPush.isEnabled) {
      console.log('Notification not enabled.');
      return;
    }

    this.swPush
      .requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY,
      })
      .then((response) => {
        console.log(response);
        this.httpClient.post('/api', response).subscribe({
          next: (resp) => {
            console.log(resp);
          },
          error: (error) => {
            console.error(error);
          },
        });
      })
      .catch((error) => console.log(error));
  }
}
