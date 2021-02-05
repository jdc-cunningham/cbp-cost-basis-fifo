### 02/04/2021
I'm going to build this split where the API calls are handled by Node and the front end consumes those changes. This will reduce API calls but also I can add more features/isolate them on the node side. Specifically I need to total all the portfolios in order but also would like to show them individually. I'll also go ahead and address the pagination issue and add the max 5 portfolios for CBP.

The UI will mostly stay the same except the extra/total tabs and a refresh icon that refreshes all data.

Requests will have artificial delay to reduce chances of throttling.