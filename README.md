# BubbleSort-DT-Custom

Repository containing required files and scripts to deploy the Driving Test using custom backend database.

## Table of Contents

- [BubbleSort-DT-Custom](#bubblesort-dt-custom)
  - [Table of Contents](#table-of-contents)
  - [Folder Structure](#folder-structure)
  - [Requirements](#requirements)
    - [Accounts](#accounts)
    - [Local Machine Installations](#local-machine-installations)
  - [Overall Setup](#overall-setup)
    - [Backend](#backend)
      - [Account Setup](#account-setup)
      - [Configuring AWS](#configuring-aws)
    - [Frontend](#frontend)
  - [Data Processing](#data-processing)

## Folder Structure

```text
|_BubbleSort-DT-Custom
  |_Backend
  |_Frontend
    |_Platform
    |_Interactive
  |_Data-Processing
  |_Scripts
  |_makefile
  |_README.md
```

## Requirements

_Note: Setting up of Amazon Web Service requirements is explained in the [**Account Setup Section**](#account-setup)._

### Accounts

- Amazon Web Services (AWS) Account
- AWS IAM authorised user
- GitHub Account

### Local Machine Installations

- AWS Command Line Interface (CLI)
- AWS Serverless Application Model (SAM) CLI
- Git
- Node.js
- Python

## Overall Setup

1. Ensure all the [_**requirements**_](#requirements) are satisfied.
2. **Fork** this repository to create your personal copy.
3. Clone the forked repository locally onto your machine. _(Requires **Git** to be set up on your local machine.)_
4. Follow the steps mentioned in the [Backend Section](#backend).
5. Enter your backend's _**Prod Stage WebEndpoint** (baseURL)_ in `backendLink.txt` (present in `Scripts` folder). The format of the file's contents should look similar to this after modification: `https://link-prelude.amazonaws.com/Prod`, where `link-prelude` is unique to your account.
    - Note:
        1. The baseURL link can be found under the _Outputs_ tab in _**CloudFormation > Stacks > DT-Backend**_. Be sure that the website's _region_ is the **same region set in the `samconfig.toml` file**.
        2. Please ensure that **only the link** is present in the `backendLink.txt` document, else the deployment may fail.
6. Enter your _**POC** (Point Of Contact)_ details in `POC.txt` (present in `Scripts` folder) by replacing the following _(spaces can be included in between the names)_:
    - `YourOrganisation` with the name of your organisation.
    - `YourName` with your name.
    - `youremail@example.com` with your e-mail ID.
    - `YourNumber` with your mobile number.
7. Follow the steps mentioned in the [Frontend Section](#frontend).

### Backend

#### Account Setup

- Set-up AWS with your credentials, including an IAM account with administrator access.
  - Refer to the [AWS SAM Getting Started Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/prerequisites.html) for detailed instructions.
  - Ensure to complete the _**Prerequisites**_ and _**Installing the AWS SAM CLI**_ steps mentioned in the above link.
  - _(Optional)_ For simplicity, you may choose the long-term credentials method.

#### Configuring AWS

1. _(Optional)_ In the `samconfig.toml` file, set the `region` to the region where you wish to host your backend.
   - The format is `region-direction-number`. Example: `ap-south-2`.
   - It is _recommended_ to set this to the region closest to your location.
2. Open the current folder in Terminal _(Linux/macOS)_ or PowerShell _(Windows)_.
    - **Linux/macOS**: Right click in the folder and choose _Open in Terminal_.
    - **Windows**: In the File Explorer window, go to the _File_ tab, and choose _Open Windows PowerShell_.
3. Run `make backend` command. _(Requires **AWS CLI** and **AWS SAM CLI** to be set up on your local machine for successful setup completion.)_
4. Note the _**baseURL**_ endpoint link displayed at the end of AWS SAM backend set-up to access the backend through APIs.
    - This can also be found in the _CloudFormation_ section in AWS Management Console.

### Frontend

1. Open the current folder in Terminal _(Linux/macOS)_ or PowerShell _(Windows)_.
    - **Linux/macOS**: Right click in the folder and choose _Open in Terminal_.
    - **Windows**: In the File Explorer window, go to the _File_ tab, and choose _Open Windows PowerShell_.
2. Run `make frontend` to set-up the frontend website. _(Requires **Python**, **Git** and **Node.js** to be set up on your local machine for successful frontend setup completion.)_

## Data Processing

1. Save the data in `RunTable` from DynamoDB into `runTable.csv`.
   1. Sign in into AWS using your IAM account. Set the website's _region_ as the **same region set in the `samconfig.toml` file**.
   2. Search for **DynamoDB** and open it. It will be listed under the _Services_ category.
   3. Open the **`Tables`** tab displayed in the sidebar.
   4. Select the table named `BubbleSort-DT-Backend-RunTable` and click _**Explore table items**_.
   5. Click the **Run** button. A list of entries in the table will be displayed.
      - If the **Retrieve next page** button appears above the table entries, keep clicking it until it disappears to load all the entries in the table.
   6. Click on the **Actions** dropdown and select _**Download results to CSV**_.
   7. Save the data in CSV file as `runTable.csv` into the `Data-Processing` folder.
2. Save the data in `RunTransitionTable` from DynamoDB into `runTransitionTable.csv`.
   1. Sign in into AWS using your IAM account. Set the website's _region_ as the **same region set in the `samconfig.toml` file**.
   2. Search for **DynamoDB** and open it. It will be listed under the _Services_ category.
   3. Open the **`Tables`** tab displayed in the sidebar.
   4. Select the table named `BubbleSort-DT-Backend-RunTransitionTable` and click _**Explore table items**_.
   5. Click the **Run** button. A list of entries in the table will be displayed.
      - If the **Retrieve next page** button appears above the table entries, keep clicking it until it disappears to load all the entries in the table.
   6. Click on the **Actions** dropdown and select _**Download results to CSV**_.
   7. Save the data in CSV file as `runTransitionTable.csv` into the `Data-Processing` folder.
3. Ensure that these two CSV files (`runTable.csv` and `runTransitionTable.csv`) are saved in the `Data-Processing` folder.
4. Open the current folder in Terminal _(Linux/macOS)_ or PowerShell _(Windows)_.
    - **Linux/macOS**: Right click in the folder and choose _Open in Terminal_.
    - **Windows**: In the File Explorer window, go to the _File_ tab, and choose _Open Windows PowerShell_.
5. Run `make data`. The final processed data is stored in `file.csv`.
