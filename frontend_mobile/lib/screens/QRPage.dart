import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

class QRPage extends StatelessWidget {
  final String code;
  QRPage({required this.code});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Entrada')),
      body: Center(child: QrImage(data: code, version: QrVersions.auto, size:200)),
    );
  }
}
