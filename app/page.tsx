'use client';
import Image from 'next/image';
import useState from 'react-usestateref';
import userPic from '../public/daftpunkSmall.webp';
import botPic from '../public/chatGptBotImage.png'
import sendBtn from '../public/sendBtn.svg'

enum Creator {
  Me = 0,
  Bot = 1
}

interface MessageProps {
  text: string;
  from: Creator;
  key: number;
}

interface InputProps {
  onSend: (input: string) => void;
  disabled: boolean;
}

// One message in the chat
const ChatMessage = ({ text, from }: MessageProps) => {
  return (
    <>
      {from == Creator.Me && (
        <div className='bg-white p-4 rounded-lg flex gap-4 items-center whitespace-pre-wrap'>
          <Image src={userPic} alt='User' width={40} />
          <p className='text-gray-700'>{text}</p>
        </div>
      )}
      {from == Creator.Bot && (
        <div className='bg-gray-100 p-4 rounded-lg flex gap-4 items-center whitespace-pre-wrap'>
          <Image src={botPic} alt='Bot' width={40} />
          <p className='text-gray-700'>{text}</p>
        </div>
      )}
    </>
  )
}

// The chat input fiel
const ChatInput = ({ onSend, disabled }: InputProps) => {
  const [input, setInput] = useState('');

  const sendInput = () => {
    onSend(input);
    setInput('');
  }

  const handleKeyDown = (event: any) => {
    if (event.keyCode === 13) {
      sendInput();
    }
  }

  return (
    <div className='bg-white border-2 p-2 rounded-lg flex justify-center'>
      <input value={input} onChange={(event: any) => setInput(event.target.value)}
        className='w-full py-2 px-3 text-gray-800 rounded-lg focus:outline-none'
        type='text'
        placeholder='Ask me anything'
        disabled={disabled}
        onKeyDown={(event) => handleKeyDown(event)}
      />
      {disabled && (<p>loading</p>)}
      {!disabled && (<Image className='cursor-pointer' src={sendBtn} alt='send' width={20} />)}
    </div>
  )
};

// Page
export default function Home() {
  const [messages, setmessages, messagesRef] = useState<MessageProps[]>([])
  const [loading, setLoading] = useState(false)

  const callApi = async (input: string) => {
    setLoading(true);

    const myMessage: MessageProps = {
      text: input,
      from: Creator.Me,
      key: new Date().getTime()
    };

    setmessages([...messagesRef.current, myMessage]);
    const response = await fetch('/api/generate-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: input
      })
    }).then((response) => response.json());
    setLoading(false);

    if (response.text) {
      const botMessage: MessageProps = {
        text: response.text,
        from: Creator.Bot,
        key: new Date().getTime()
      };
      setmessages([...messagesRef.current, botMessage]);
    } else {
      //error
    }
  };

  return (
    <main className='relative max-w-2xl max-auto'>
      <div className='sticky top-0 w-full pt-10 px-4'>
        <ChatInput onSend={(input) => callApi(input)} disabled={loading} />
      </div>

      <div className='mt-10 px-4'>
        {messages.map((message: MessageProps) => (
          <ChatMessage key={message.key} text={message.text} from={message.from} />
        ))}
        {messages.length == 0 && <p className='text-center text-gray-400'>I am at your service</p>}
      </div>
    </main>
  )
}