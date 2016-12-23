# MondayNightPinball Resource API

This API currently handles the CRD of CRUD for player objects. Each player has a name and email (for now), and IDs will be auto-assigned. This API uses express for the service and routing layers.

# API

## GET /api/player?id=player_id
Gets a player from the system. Returns application/json of the player object, or 404 if not found.

## POST /api/player
Add a player to the system.
```js
{
  name: 'First Last',
  email: 'someone@example.com'
}
```
Both `name` and `email` are required in the post body. API expects content type of application/json. Returns a 201 with the newly created player, or a 400 if name or email are missing or not valid.

## PUT /api/player
Update a player
```js
{
  name: 'Updated Name',
  email: 'updated@example.com'
}
```
Update can include name and/or email. Only supplied values will be updated. Should return a 202 on success, and 404 if the player is not found.

## DELETE /api/player?id=player_id
Removes a player from the system, if found. Returns status 204 on success.
