import 'dart:convert';

import 'package:dart_appwrite/dart_appwrite.dart';

import 'fcm_service.dart';

Future<void> start(final req, final res) async {
  final client = Client(
    endPoint: 'https://cloud.appwrite.io/v1',
    selfSigned: true,
  ).setProject('6472f8e636a915c8dc64').setKey(req.variables['API_KEY']);

  final String? serverKey = req.variables['FMC_SERVER_KEY'];

  if (serverKey == null) {
    print('FMC_SERVER_KEY is not set');
    res.send('FMC_SERVER_KEY is not set', status: 500);
    return;
  }

  try {
    final payload = jsonDecode(req.payload);

    final title = payload['title'] as String?;
    final body = payload['body'] as String?;
    final senderId = payload['senderId'] as String?;
    final receiverId = payload['receiverId'] as String?;

    if ([title, body, senderId].contains(null)) {
      res.json({
        'error': "error_req_data",
      });
    }

    final document = await Databases(client).getDocument(
      databaseId: "main",
      collectionId: "profiles",
      documentId: receiverId!,
    );

    final fcmToken = document.data['fcmToken'];
    final fcmService = FCMService();

    if (fcmToken != null) {
      await fcmService.sendFCMToUser(
        serverKey: serverKey,
        userFCMToken: fcmToken,
        data: {
          'type': "chat",
          'senderId': senderId,
        },
        notificationData: {
          'title': title,
          'body': body,
        },
      );
      res.json({
        'done': true,
      });
    } else {
      res.json({
        'error': 'fcm_token_not_exists',
      });
    }
  } catch (e) {
    res.json({
      'error': '$e',
    });
  }
}
