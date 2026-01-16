# 🤝 Contributing to Moodify

Thank you for your interest in contributing to Moodify! This document provides guidelines and information for contributors.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Feature Requests](#feature-requests)
- [Bug Reports](#bug-reports)

---

## 📜 Code of Conduct

### Our Standards

- **Be respectful** - Treat everyone with respect and kindness
- **Be inclusive** - Welcome newcomers and help them learn
- **Be constructive** - Provide helpful feedback
- **Be patient** - Remember everyone is learning

### What We Don't Tolerate

- Harassment, discrimination, or offensive language
- Trolling or insulting/derogatory comments
- Personal or political attacks
- Publishing others' private information

---

## 🛠️ How Can I Contribute?

### 1. 🐛 Reporting Bugs

Found a bug? Help us fix it!

**Before submitting:**
- Check existing issues to avoid duplicates
- Test on the latest version
- Gather relevant information

**Include in your report:**
- Clear, descriptive title
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, browser)

**Example bug report:**
```markdown
**Title:** Playlist creation fails with 50+ songs

**Description:** 
When trying to create a playlist with more than 50 songs, 
the app throws a timeout error.

**Steps to Reproduce:**
1. Select "Energetic" mood
2. Set track count to 50
3. Click "Create Playlist"

**Expected:** Playlist created successfully
**Actual:** Error: "Request timeout"

**Environment:**
- OS: Windows 11
- Node: v18.16.0
- Browser: Chrome 120
```

### 2. 💡 Suggesting Features

Have an idea? We'd love to hear it!

**Before submitting:**
- Check if it's already suggested
- Consider if it fits the project scope
- Think about implementation approach

**Include in your suggestion:**
- Clear description of the feature
- Use cases and benefits
- Possible implementation ideas
- Examples from other apps (if applicable)

### 3. 📝 Improving Documentation

Documentation improvements are always welcome:
- Fix typos or clarify instructions
- Add examples or tutorials
- Improve README sections
- Create video guides

### 4. 💻 Contributing Code

Ready to code? Here's how:

1. **Find an issue** to work on (or create one)
2. **Comment** on the issue to let others know you're working on it
3. **Fork** the repository
4. **Create a branch** for your feature
5. **Make your changes** following our guidelines
6. **Test thoroughly**
7. **Submit a pull request**

---

## 🚀 Development Setup

### Prerequisites

- Node.js v14 or higher
- npm or yarn
- Git
- Code editor (VS Code recommended)
- Spotify Developer account

### Initial Setup

1. **Fork and clone:**
```bash
git clone https://github.com/YOUR-USERNAME/moodify.git
cd moodify
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your Spotify credentials
```

4. **Start development server:**
```bash
npm start
```

5. **Test in browser:**
Open `http://127.0.0.1:5500`

### Development Workflow

1. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing patterns
   - Add comments for complex logic

3. **Test your changes:**
   - Manual testing in browser
   - Test on different moods
   - Test error scenarios
   - Check mobile responsiveness

4. **Commit your changes:**
```bash
git add .
git commit -m "feat: add your feature description"
```

5. **Push to your fork:**
```bash
git push origin feature/your-feature-name
```

6. **Create Pull Request** on GitHub

---

## 📏 Coding Standards

### JavaScript Style

**General:**
- Use ES6+ features (const, let, arrow functions)
- Use semicolons
- Use single quotes for strings
- 4-space indentation

**Example:**
```javascript
// ✅ Good
const getUserAlbums = async (accessToken) => {
    try {
        const response = await fetch(`/api/albums?access_token=${accessToken}`);
        const data = await response.json();
        return data.items;
    } catch (error) {
        console.error('Error fetching albums:', error);
        throw error;
    }
};

// ❌ Avoid
function getUserAlbums(accessToken) {
    return fetch("/api/albums?access_token=" + accessToken).then(function(response) {
        return response.json()
    }).then(function(data) {
        return data.items
    })
}
```

**Naming Conventions:**
- Functions: `camelCase` (e.g., `calculateMoodScore`)
- Variables: `camelCase` (e.g., `userAlbums`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MOOD_PROFILES`)
- Classes: `PascalCase` (e.g., `MoodAnalyzer`)

### CSS Style

- Use class selectors over IDs
- Group related properties
- Use meaningful class names
- Mobile-first responsive design

**Example:**
```css
/* ✅ Good */
.mood-card {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.mood-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* ❌ Avoid */
#card { padding:10px; background:#fff; }
```

### HTML Style

- Semantic HTML5 elements
- Proper indentation
- Descriptive IDs and classes
- Accessibility attributes

**Example:**
```html
<!-- ✅ Good -->
<section class="mood-selection" aria-label="Mood selection">
    <h2 class="mood-title">How are you feeling today?</h2>
    <button class="mood-card" data-mood="happy" aria-label="Select happy mood">
        <span class="mood-icon">😊</span>
        <span class="mood-name">Happy</span>
    </button>
</section>

<!-- ❌ Avoid -->
<div class="box">
    <div class="title">How are you feeling today?</div>
    <div onclick="selectMood('happy')">😊 Happy</div>
</div>
```

### Node.js/Express Style

- Use async/await over callbacks
- Proper error handling
- Clear route organization
- Validate input data

**Example:**
```javascript
// ✅ Good
app.get('/api/albums', async (req, res) => {
    const { access_token } = req.query;
    
    if (!access_token) {
        return res.status(400).json({ error: 'Access token required' });
    }
    
    try {
        const albums = await fetchUserAlbums(access_token);
        res.json({ albums });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch albums' });
    }
});
```

---

## 📝 Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(playlist): add ability to set playlist privacy"

# Bug fix
git commit -m "fix(auth): resolve token refresh loop issue"

# Documentation
git commit -m "docs(readme): add deployment instructions for Railway"

# Style
git commit -m "style(css): improve mood card hover animations"

# Refactor
git commit -m "refactor(api): simplify mood scoring algorithm"
```

### Good Commit Practices

✅ **Do:**
- Write clear, concise messages
- Use present tense ("add" not "added")
- Keep subject line under 50 characters
- Add detailed body for complex changes
- Reference issues: `fixes #123`

❌ **Don't:**
- Use vague messages: "fix stuff" or "update"
- Combine unrelated changes
- Commit commented-out code
- Include sensitive data

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Test thoroughly** on multiple scenarios
3. **Check code style** follows guidelines
4. **Rebase on latest main** to avoid conflicts
5. **Write clear PR description**

### PR Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
How has this been tested?
- [ ] Manual testing on local environment
- [ ] Tested on Chrome/Firefox
- [ ] Tested mobile responsiveness
- [ ] Tested error scenarios

## Screenshots
(if applicable)

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Tested on multiple moods
```

### Review Process

1. **Automated checks** run automatically
2. **Maintainer review** - we'll provide feedback
3. **Address feedback** - make requested changes
4. **Approval** - once everything looks good
5. **Merge** - we'll merge your contribution!

### After Merge

- Your contribution is live! 🎉
- You'll be added to contributors list
- Feel free to contribute more!

---

## 🐛 Bug Reports

### Required Information

When reporting a bug, please include:

1. **Environment:**
   - OS and version
   - Node.js version (`node --version`)
   - Browser and version
   - Moodify version

2. **Steps to Reproduce:**
   - Detailed step-by-step instructions
   - Sample data or inputs used

3. **Expected Behavior:**
   - What should happen

4. **Actual Behavior:**
   - What actually happened
   - Error messages (check browser console)

5. **Screenshots/Videos:**
   - Visual evidence helps a lot!

6. **Logs:**
   - Server logs (if applicable)
   - Browser console output

### Bug Report Template

```markdown
**Environment:**
- OS: Windows 11
- Node: v18.16.0
- Browser: Chrome 120.0
- Moodify: v1.0.0

**Steps to Reproduce:**
1. Connect to Spotify
2. Select "Happy" mood
3. Click "Find Album"

**Expected Behavior:**
App should display happy albums

**Actual Behavior:**
App shows error: "No albums found"
But I have 50+ albums saved

**Console Output:**
```
Error: Failed to fetch audio features
Status: 429
```

**Screenshots:**
[Attach screenshot here]

**Additional Context:**
This happens only with Happy mood, other moods work fine
```

---

## 💡 Feature Requests

### What Makes a Good Feature Request?

1. **Solves a real problem** - Why is this needed?
2. **Fits project scope** - Is it aligned with Moodify's goals?
3. **Feasible to implement** - Can it be done?
4. **Detailed description** - Clear explanation

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem. Ex: "I'm frustrated when..."

**Describe the solution you'd like:**
Clear description of what you want to happen

**Describe alternatives you've considered:**
Other solutions or features you've thought about

**Use Cases:**
Real-world scenarios where this would be useful

**Implementation Ideas:**
(Optional) How you think it could be built

**Examples:**
Links to similar features in other apps

**Additional Context:**
Any other information, screenshots, or mockups
```

---

## 🎯 Good First Issues

New to contributing? Look for issues labeled:
- `good first issue` - Easy tasks for beginners
- `help wanted` - We need community help
- `documentation` - Docs improvements

---

## 🏆 Recognition

All contributors will be:
- Added to the contributors list
- Credited in release notes
- Mentioned in our documentation

---

## 📞 Questions?

- Open a [Discussion](https://github.com/yourusername/moodify/discussions)
- Join our community chat (if available)
- Email: [your-email]

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Moodify! 🎵**

Every contribution, no matter how small, makes a difference!

