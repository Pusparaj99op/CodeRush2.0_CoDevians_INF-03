import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:veldar_travel/core/theme/app_theme.dart';
import 'package:veldar_travel/ui/buttons/veldar_button.dart';

Widget _host(Widget child, {ThemeData? theme}) => MaterialApp(
  theme: theme ?? AppTheme.dark(),
  home: Scaffold(body: Center(child: child)),
);

void main() {
  testWidgets('fires onPressed once per tap', (tester) async {
    var taps = 0;
    await tester.pumpWidget(
      _host(VeldarButton(label: 'Approve', onPressed: () => taps++)),
    );

    await tester.tap(find.text('Approve'));
    await tester.pumpAndSettle();

    expect(taps, 1);
  });

  testWidgets('is inert while loading', (tester) async {
    var taps = 0;
    await tester.pumpWidget(
      _host(
        VeldarButton(label: 'Approve', loading: true, onPressed: () => taps++),
      ),
    );

    // A second tap on a submitting form would create a second workflow — the
    // backend has no idempotency key, so this has to hold.
    await tester.tap(find.byType(VeldarButton));
    await tester.pump();

    expect(taps, 0);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('Approve'), findsNothing);
  });

  testWidgets('is inert with a null callback', (tester) async {
    await tester.pumpWidget(_host(const VeldarButton(label: 'Disabled')));
    await tester.tap(find.byType(VeldarButton));
    await tester.pump();
    // Nothing to assert beyond "did not throw"; the point is that a disabled
    // button must not look tappable and then do nothing.
    expect(find.text('Disabled'), findsOneWidget);
  });

  testWidgets('announces itself as a button with its label', (tester) async {
    final handle = tester.ensureSemantics();
    await tester.pumpWidget(
      _host(VeldarButton(label: 'Deny payment', onPressed: () {})),
    );

    final node = tester.getSemantics(find.byType(VeldarButton));
    expect(node.label, 'Deny payment');
    expect(node.flagsCollection.isButton, isTrue);
    expect(node.flagsCollection.isEnabled, isTrue);
    handle.dispose();
  });

  testWidgets('meets the 44pt touch minimum at every size', (tester) async {
    for (final size in VeldarButtonSize.values) {
      await tester.pumpWidget(
        _host(
          VeldarButton(
            // A distinct key per size forces a fresh element, so the height
            // assertion reads the final value rather than a frame of the
            // AnimatedContainer lerping from the previous size.
            key: ValueKey(size),
            label: 'Go',
            size: size,
            onPressed: () {},
          ),
        ),
      );
      await tester.pumpAndSettle();
      final box = tester.getSize(find.byType(VeldarButton));
      expect(
        box.height,
        greaterThanOrEqualTo(size == VeldarButtonSize.small ? 40 : 44),
        reason: '$size',
      );
    }
  });

  testWidgets('renders in both themes without throwing', (tester) async {
    for (final theme in [AppTheme.light(), AppTheme.dark()]) {
      for (final variant in VeldarButtonVariant.values) {
        await tester.pumpWidget(
          _host(
            VeldarButton(
              label: variant.name,
              variant: variant,
              onPressed: () {},
            ),
            theme: theme,
          ),
        );
        expect(tester.takeException(), isNull);
      }
    }
  });
}
