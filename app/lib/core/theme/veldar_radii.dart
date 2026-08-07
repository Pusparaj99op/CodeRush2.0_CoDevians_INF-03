import 'package:flutter/widgets.dart';

/// Corner radii, mapped from the website's Tailwind scale:
/// `rounded-xl` (12) on rows and inputs, `rounded-2xl` (16) on cards,
/// `rounded-full` on every button and pill.
abstract final class Radii {
  static const sm = 8.0;
  static const row = 12.0; // rounded-xl
  static const card = 16.0; // rounded-2xl
  static const sheet = 24.0;

  static const rowShape = BorderRadius.all(Radius.circular(row));
  static const cardShape = BorderRadius.all(Radius.circular(card));
  static const smShape = BorderRadius.all(Radius.circular(sm));

  /// Sheets are rounded on the top edge only.
  static const sheetShape = BorderRadius.vertical(top: Radius.circular(sheet));

  /// `rounded-full` — a large radius rather than StadiumBorder so it composes
  /// with BoxDecoration.
  static const pillShape = BorderRadius.all(Radius.circular(999));
}
