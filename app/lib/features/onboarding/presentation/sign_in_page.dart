import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/veldar_palette.dart';
import '../../../core/theme/veldar_spacing.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../providers/auth_providers.dart';
import '../../../ui/feedback/state_views.dart';
import '../../../ui/motion/reveal.dart';
import '../widgets/google_sign_in_button.dart';
import '../widgets/veldar_mark.dart';

/// Google-only sign-in, matching the website's auth flow against the same
/// Firebase project — so an account created on codevians.online signs straight
/// in here and sees the same workflows.
class SignInPage extends ConsumerWidget {
  const SignInPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final p = context.palette;
    final text = Theme.of(context).textTheme;
    final signIn = ref.watch(signInControllerProvider);

    final error = signIn.hasError ? signIn.error : null;
    // A dismissed account picker is a deliberate user action, not a failure —
    // showing a red banner for it would be scolding them for changing their
    // mind.
    final showError =
        error != null &&
        !(error is AuthFailure && error.message == 'Sign-in cancelled.');

    return Scaffold(
      backgroundColor: p.bg,
      body: Stack(
        children: [
          const AmbientGlow(alignment: Alignment.topLeft, diameter: 360),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(Insets.gutter),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Reveal(
                        child: Center(
                          child: VeldarMark(size: 52, showWordmark: false),
                        ),
                      ),
                      const SizedBox(height: Insets.xxxl),
                      Reveal(
                        delay: const Duration(milliseconds: 80),
                        child: Semantics(
                          header: true,
                          child: Text(
                            'Welcome back',
                            style: text.displayMedium,
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                      const SizedBox(height: Insets.md),
                      Reveal(
                        delay: const Duration(milliseconds: 140),
                        child: Text(
                          'Sign in to plan trips and watch every offer, '
                          'approval and receipt.',
                          style: text.bodyMedium!.copyWith(color: p.muted),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(height: Insets.xxxl),
                      if (showError) ...[
                        InlineBanner(
                          message: error is AuthFailure
                              ? error.message
                              : 'Sign-in failed. Please try again.',
                          tone: BannerTone.danger,
                        ),
                        const SizedBox(height: Insets.lg),
                      ],
                      Reveal(
                        delay: const Duration(milliseconds: 200),
                        child: GoogleSignInButton(
                          label: 'Continue with Google',
                          loading: signIn.isLoading,
                          onPressed: signIn.isLoading
                              ? null
                              : () => ref
                                    .read(signInControllerProvider.notifier)
                                    .signInWithGoogle(),
                        ),
                      ),
                      const SizedBox(height: Insets.xxl),
                      Text(
                        'By continuing you agree to the Terms of Service and '
                        'Privacy Policy.',
                        style: text.bodySmall!.copyWith(color: p.dim),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
