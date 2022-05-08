module.exports = {
  display: {
    notifications: true,
    offendingContent: true,
    rulesSummary: false,
    shortStats: true,
    verbose: false,
  },
  rules: [
    {
      message: "Tu as des marqueurs de conflits qui traînent",
      regex: /^[<>|=]{4,}/m,
    },
    {
      filter: /\.tsx$/,
      message: '🤔 Hum ! N’as-tu pas oublié de retirer du "console.log(…)" ?',
      regex: /^\s*console\.log/,
    },
  ],
};