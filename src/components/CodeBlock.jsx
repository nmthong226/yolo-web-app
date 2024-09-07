import { CodeBlock, dracula } from 'react-code-blocks';

const MyCodeBlock = ({ code, language, showLineNumbers }) => {
  return (
    <CodeBlock
      text={code}
      language={language}
      showLineNumbers={showLineNumbers}
      theme={dracula}
      codeBlock
    />
  );
}

export default MyCodeBlock