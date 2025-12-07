import 'package:flutter/material.dart';
import 'screens/QRPage.dart';
void main()=>runApp(MyApp());
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(title:'EventoApp',home:QRPage(code:'test-code'));
  }
}
