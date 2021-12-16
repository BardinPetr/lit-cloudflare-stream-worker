# Lit integration with Cloudflare Stream - server

This is a CloudFlare Worker for using [LIT network](https://litprotocol.com/) as authentication layer for CloudFlare Stream service using JWT.  
React client is located [here](https://github.com/BardinPetr/lit-cloudflare-stream-client). All steps described is `Idea` section is implemented in corresponding component.

### Key features

- [x] Automated setup and deployment
- [x] Authentication using `BLS12-381` LIT JWTs
- [x] Support for multiple CloudFlare accounts
- [x] Separated and authenticated endpoints for uploading and securing video
- [x] One time upload URL with ability to put length restrictions
- [x] Dynamically-generated 'signed URLs' for videos with maximum security
- [ ] Server side edition-like feature for LIT access control conditions [In Progress]

### Idea

The server can handle multiple CloudFlare Stream _(hereinafter I call it CF and CFS)_ accounts simultaneously so the first step is to register your account on server. For that you need _CF account ID_, _CF token_ with _Stream:Edit_ permission [issued](https://dash.cloudflare.com/profile/api-tokens) and _Register Secret_ which is set up on server deployment and ensures that service can be used by some group. This credentials are stored in CF KV and pulled from storage on request according to requested account.
The process of video publication involves 2 steps: file uploading and setting up access control conditions (hereinafter ACC). This separation allows admins to take full control of videos already had been uploaded on CF and set different ACCs on each step, i.e. to upload video or restrict access to it, user must be already authorized using LIT network for this action. In registration process administrator (CFS account handler) is ought to select ACCs for each action.
API methods in this server is divided in 3 groups: _unauthenticated_ (list videos, get video info/accs, get video thumbnail), authenticated by _JWT issued in LIT_ (watch video, upload, setup) and registration method which takes only _register secret_. For detailed information on each method please refer to corresponding section. JWT is placed in `Authentication='Bearer jwt'` request header. It is verified over these parameters:

- baseUrl -> hostname (without http or path, just domain name)
- path -> request path (_/video/xyz_ for video with ID=='xyz', _/register_, _/setup_)
- orgId -> CF account ID
- iss -> 'LIT'
- exp

Also all requests should have `CF_ACCOUNT` header with _CF account ID_, the server also allows to put it in query param `?user_id=xyz` to have compatibility with basic HTML tags like `<img>`.

When using `/upload` route, after successful authentication, the user is issued with CF's one time upload URL and no restrictions are applied, with this URL user can finish upload by common methods described in CF docs. The JWT should be generated for following LIT resource:

```js
const resourceId = {
  baseUrl: new URL(url).hostname,
  path: '/upload',
  orgId: userId,
  role: 'uploader',
  extraData: '',
}
```

Later user can get this video info using `/info/:id` _(one video with specified id)_ or `/videos` _(all videos)_ route, which contains main properties from original CFS video info augmented with `acc` property - LIT ACCs (which has 0 length if this video is not restricted, it that case you can directly use `stream` property to watch) and `thumbnail` property which a copy from original if video is not restricted or it could be this servers endpoint `/thumb/:id` which allows showing to user video thumbnails despite it is locked (original CFS don't allow).

After client got video ID which is needed to be locked, it should call `/setup` endpoint which will store provided ACCs into CFS video data meta property and lock it using `requireSignedURLs=true`. The JWT should be generated for following LIT resource:

```js
const resourceId = {
  baseUrl: new URL(url).hostname,
  path: '/setup',
  orgId: userId,
  role: 'admin',
  extraData: '',
}
```

To watch video, the user should, as usual, get JWT from LIT and call `/video/:id` endpoint. After JWT is validated, user is issued with CFS's _"signedURL"_ (which is another JWT). This token is generated via JWK requested from CF on the step of "registration" using CF's `/keys` method and stored in KV. Now client can get short time access to requested video using any common way described in CFS docs.

> _This is the most secure way for delivering users locked videos as they couldn't take away the token and use it as they wish, we ensure that it is issued for one-time watch and user can't get access again if he loses some of the ACCs by using described dynamic key generation_

## Deployment

```shell
git clone !!!!!!!
yarn
```

Now, before we begin, please fill [wrangler.toml](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/wrangler.toml) as it is described in CF docs.
To deploy service you can use NodeJS code located at [`scripts/deploy.js`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/scripts/deploy.js). It also contains some docs inside which can be useful.
For that you should create `.env` file (use [`.env.template`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/.env.template) as example). It contains following fields:

```env
CF_ACCOUNT_ID - Cloudflare account id
CF_API_TOKEN - Cloudflare API token with Workers_KV_Storage:Edit, Workers_Scripts:Edit, Stream:Edit permissions
MAX_VIDEO_DURATION - Maximum duration of video to be uploded via one time url (min 1s, max 21600s)
REGISTER_SECRET - secret key for registration in service (see previous section)
```

You can issue token at [CF profile page](https://dash.cloudflare.com/profile/api-tokens)
_Please note that CF_API_TOKEN should have all three permission set as without the server will fail to deploy or won't work. Even when you do not plan to use you own CFS account for video storage it is used as fallback and fail without._

Now you are ready to run the script. Keep in mind that it is better to omit `wrangler login`, as the script does everything by itself via passing to wrangler environment.

```shell
yarn deploy
```

You are all set!

### Development

For maximum convenience in development I use [miniflare](https://miniflare.dev/).
Please fill the `.env` as described previously. Then the process is simple. You can even use VSCode's debugger to run this command and work with the code.

```shell
yarn dev
```

### API

> Also try [Postman collection]()

### 1: `POST` `/register`

#### Description

Registers new CFS account in server to operate with it later. See 'idea' section for more.

#### Headers:

```
Authorization: Bearer ${LIT_JWT} // see required resource_id in 'idea' section
CF_ACCOUNT: ${cloudflare_user_id}
```

#### Body:

See more [`interface RegisterRequest`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/routes/models.ts#L8).
| Property | Type | Description |
|--|--|--|
| account | `string` | CF acc id |
| token | `string` | CF token with Stream:Edit permission|
| accUpload | [`AccessControlConditions`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/auth/models.ts#L13) | ACCs for getting video one time upload URL |
| accSetup | [`AccessControlConditions`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/auth/models.ts#L13) | ACCs for setting ACCs on video |

##### Example

```json
{
  "account": "ad689a4c7ee776c5c881c7e04cad097b",
  "token": "xxxxxxxxxxxxxxxxx",
  "accSetup": [
    {
      "contractAddress": "",
      "standardContractType": "",
      "chain": "ropsten",
      "method": "",
      "parameters": [":userAddress"],
      "returnValueTest": {
        "comparator": "=",
        "value": "0x8708F3e0718084fA5A50DC664783677a3a05eD6d"
      }
    }
  ],
  "accUpload": [
    {
      "contractAddress": "",
      "standardContractType": "",
      "chain": "ropsten",
      "method": "",
      "parameters": [":userAddress"],
      "returnValueTest": {
        "comparator": "=",
        "value": "0x8708F3e0718084fA5A50DC664783677a3a05eD6d"
      }
    }
  ]
}
```

#### Statuses:

| Code | Description                                        |
| ---- | -------------------------------------------------- |
| 200  | OK                                                 |
| 400  | Can't register account as it is already registered |
| 403  | JWT invalid                                        |
| 500  | Interaction with CF failed                         |

#### Response [OK]

### 2: `GET` `/upload/:id`

#### Description

Get [one-time CFS video upload URL](https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads) with maximum video time set up on time of deployment by `MAX_VIDEO_DURATION`.

#### Headers:

```
Authorization: Bearer ${LIT_JWT} // see required resource_id in 'idea' section
CF_ACCOUNT: ${cloudflare_user_id}
```

#### Parameters:

| Property | Type     | Description | Comment                 |
| -------- | -------- | ----------- | ----------------------- |
| id       | `string` | Video ID    | _replaces :id in path _ |

##### Example:

`https://example.com/upload/668759882b3e437f9d6554c5a5e00189`

#### Statuses:

| Code | Description                |
| ---- | -------------------------- |
| 200  | OK                         |
| 403  | JWT invalid                |
| 404  | Video not found            |
| 500  | Interaction with CF failed |

#### Response:

`string` - CFS upload URL

##### Example

`https://upload.videodelivery.net/f65014bc6ff5419ea86e7972a047ba22`

### 3: `POST` `/setup`

#### Description

Set video `requireSignedURLs=true` and apply ACCs for it.

> Important: the server doesn't interact with LIT directly. It is on the client library, as CF Workers has limitations on execution time

#### Headers:

```
Authorization: Bearer ${LIT_JWT} // see required resource_id in 'idea' section
CF_ACCOUNT: ${cloudflare_user_id}
```

#### Body:

See more [`interface VideoSetupRequest`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/routes/models.ts#L3).
| Property | Type | Description |
|--|--|--|
| id | `string` | Video ID |
| acc | [`AccessControlConditions`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/auth/models.ts#L13) | ACCs for video |

##### Example

```json
{
  "id": "ed3771762502aa8605c47dffaa01abf9",
  "acc": [
    {
      "contractAddress": "",
      "standardContractType": "",
      "chain": "ropsten",
      "method": "",
      "parameters": [":userAddress"],
      "returnValueTest": {
        "comparator": "=",
        "value": "0x8708F3e0718084fA5A50DC664783677a3a05eD6d"
      }
    }
  ]
}
```

#### Statuses:

| Code | Description                |
| ---- | -------------------------- |
| 200  | OK                         |
| 403  | JWT invalid                |
| 404  | Video not found            |
| 500  | Interaction with CF failed |

#### Response

See [`interface CFVideoDetails`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/videos/models.ts#L24)

### 4: `GET` `/videos`

#### Description

Lists all videos from selected CFS account is short form.

#### Headers:

```
CF_ACCOUNT: ${cloudflare_user_id}
```

#### Statuses:

| Code | Description                |
| ---- | -------------------------- |
| 200  | OK                         |
| 404  | Account invalid            |
| 500  | Interaction with CF failed |

#### Response:

See [`interface ShortVideoInfo`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/videos/models.ts#L78) and [`interface AccessControlConditions`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/auth/models.ts#L13)

Array of ShortVideoInfo:
| Property | Type | Description |
|--|--|--|
| id | `string` | Video id |
| name | `string` | Video name |
| height, width | `number` | Dimensions |
| thumbnail | `string` | URL for thumbnail for `/thumb/:id` endpoint |
| stream | `string` | Original CF stream URL |
| acc | [`AccessControlConditions`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/auth/models.ts#L13) | LIT ACCs |

##### Example

```json
[
  {
    "id": "8d4ecec6bffa492cb67b9f1cdb152032",
    "height": 640,
    "width": 360,
    "name": "vid2.mp4",
    "thumbnail": "http://localhost:8787/thumb/8d4ecec6bffa492cb67b9f1cdb152032?user_id=ad689a4c7ee776c5c881c7e04cad097b",
    "stream": "https://videodelivery.net/8d4ecec6bffa492cb67b9f1cdb152032/manifest/video.m3u8",
    "acc": [
      {
        "contractAddress": "",
        "standardContractType": "",
        "chain": "ropsten",
        "method": "",
        "parameters": [":userAddress"],
        "returnValueTest": {
          "comparator": "=",
          "value": "0x8708F3e0718084fA5A50DC664783677a3a05eD6d"
        }
      }
    ]
  }
]
```

### 5: `GET` `/info/:id`

#### Description

Returns video information like `/videos` but for specified one.

#### Headers:

```
CF_ACCOUNT: ${cloudflare_user_id}
```

#### Parameters:

| Property | Type     | Description | Comment                 |
| -------- | -------- | ----------- | ----------------------- |
| id       | `string` | Video ID    | _replaces :id in path _ |

##### Example:

`https://example.com/info/668759882b3e437f9d6554c5a5e00189`

#### Statuses:

| Code | Description                |
| ---- | -------------------------- |
| 200  | OK                         |
| 404  | Video not found            |
| 500  | Interaction with CF failed |

#### Response:

See [`interface ShortVideoInfo`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/videos/models.ts#L78) and [`interface AccessControlConditions`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/auth/models.ts#L13)
ShortVideoInfo:
| Property | Type | Description |
|--|--|--|
| id | `string` | Video id |
| name | `string` | Video name |
| height, width | `number` | Dimensions |
| thumbnail | `string` | URL for thumbnail for `/thumb/:id` endpoint |
| stream | `string` | Original CF stream URL |
| acc | [`AccessControlConditions`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/auth/models.ts#L13) | LIT ACCs |

##### Example

```json
{
  "id": "8d4ecec6bffa492cb67b9f1cdb152032",
  "height": 640,
  "width": 360,
  "name": "vid2.mp4",
  "thumbnail": "http://localhost:8787/thumb/8d4ecec6bffa492cb67b9f1cdb152032?user_id=ad689a4c7ee776c5c881c7e04cad097b",
  "stream": "https://videodelivery.net/8d4ecec6bffa492cb67b9f1cdb152032/manifest/video.m3u8",
  "acc": [
    {
      "contractAddress": "",
      "standardContractType": "",
      "chain": "ropsten",
      "method": "",
      "parameters": [":userAddress"],
      "returnValueTest": {
        "comparator": "=",
        "value": "0x8708F3e0718084fA5A50DC664783677a3a05eD6d"
      }
    }
  ]
}
```

### 6: `GET` `/thumb/:id`

#### Description

Thumbnail image file for video by id.

#### Headers:

```
CF_ACCOUNT: ${cloudflare_user_id} // or use ?user_id=cloudflare_user_id
```

#### Parameters:

| Property | Type     | Description | Comment                 |
| -------- | -------- | ----------- | ----------------------- |
| id       | `string` | Video ID    | _replaces :id in path _ |

##### Example:

`http://localhost:8787/thumb/8d4ecec6bffa492cb67b9f1cdb152032?user_id=ad689a4c7ee776c5c881c7e04cad097b`

#### Statuses:

| Code | Description                |
| ---- | -------------------------- |
| 200  | OK                         |
| 404  | Video not found            |
| 500  | Interaction with CF failed |

#### Response:

Image file

### 7: `GET` `/accs`

#### Description

Returns ACCs required for uploading and setting up restrictions on video.

#### Headers:

```
CF_ACCOUNT: ${cloudflare_user_id}
```

#### Statuses:

| Code | Description                |
| ---- | -------------------------- |
| 200  | OK                         |
| 400  | Invalid account            |
| 500  | Interaction with CF failed |

#### Response:

See [`interface ACCResponse`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/routes/models.ts#L15) and [`interface AccessControlConditions`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/auth/models.ts#L13)

ShortVideoInfo:
| Property | Type | Description |
|--|--|--|
| accSetup | [`AccessControlConditions`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/auth/models.ts#L13) | LIT ACC for accessing `/setup` route |
| accUpload | [`AccessControlConditions`](https://github.com/BardinPetr/lit-cloudflare-stream-worker/blob/master/src/auth/models.ts#L13) | LIT for accessing `/upload` route |

##### Example

```json
{
  "accSetup": [
    {
      "contractAddress": "",
      "standardContractType": "",
      "chain": "ropsten",
      "method": "",
      "parameters": [":userAddress"],
      "returnValueTest": {
        "comparator": "=",
        "value": "0x8708F3e0718084fA5A50DC664783677a3a05eD6d"
      }
    }
  ],
  "accUpload": [
    {
      "contractAddress": "",
      "standardContractType": "",
      "chain": "ropsten",
      "method": "",
      "parameters": [":userAddress"],
      "returnValueTest": {
        "comparator": "=",
        "value": "0x8708F3e0718084fA5A50DC664783677a3a05eD6d"
      }
    }
  ]
}
```
