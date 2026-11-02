import { StyleSheet } from 'react-native';
import { colors, fonts, radius, shadows } from '../../styles';

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingVertical: 16,
  },
  logoBox: {
    alignSelf: 'flex-start',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    ...shadows.card,
  },
  logo: {
    width: 48,
    height: 48,
  },
  welcome: {
    fontSize: 28,
    lineHeight: 34,
    marginTop: 28,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  card: {
    marginTop: 28,
    padding: 24,
  },
  cardTitle: {
    fontSize: 17,
  },
  cardSubtitle: {
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 17,
  },
  otpInput: {
    marginTop: 16,
  },
  button: {
    marginTop: 24,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  changeNumber: {
    fontFamily: fonts.medium,
    textDecorationLine: 'underline',
  },
  resend: {
    fontFamily: fonts.semiBold,
    color: colors.primaryNavy,
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 32,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
    backgroundColor: 'rgba(242, 239, 233, 0.6)',
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});

