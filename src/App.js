import './App.css';
import React, { useState , useEffect} from 'react';
import Preview from './components';
import Message from './components/Message';
import NotesContainer from './components/NoteContainer';
import NoteList from './components/NoteList'
import Note from './components/Note';
import NoteForm from './components/NoteForm';
import Alert from './components/index2';

function App() {

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // استرجاع البيانات المحفوظة
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        setNotes([]);
      }
    } else {
      localStorage.setItem('notes', JSON.stringify([]));
    }
  }, []);

  // إخفاء رسائل التنبيه بعد 3 ثوانٍ
  useEffect(() => {
    if (validationErrors.length !== 0) {
      const timer = setTimeout(() => {
        setValidationErrors([]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [validationErrors]);

  const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // التحقق من ملء حقول الملاحظة
  const validate = () => {
    const errors = [];
    let passed = true;
    if (!title.trim()) {
      errors.push("الرجاء إدخال عنوان الملاحظة");
      passed = false;
    }
    if (!content.trim()) {
      errors.push("الرجاء إدخال محتوى الملاحظة");
      passed = false;
    }
    setValidationErrors(errors);
    return passed;
  };

  // تغيير عنوان الملاحظة
  const changeTitleHandler = (event) => {
    setTitle(event.target.value);
  };

  // تغيير محتوى الملاحظة
  const changeContentHandler = (event) => {
    setContent(event.target.value);
  };

  // حفظ ملاحظة جديدة
  const saveNoteHandler = () => {
    if (!validate()) return;

    const note = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim()
    };

    const updatedNotes = [...notes, note];
    saveToLocalStorage('notes', updatedNotes);
    setNotes(updatedNotes);
    setCreating(false);
    setSelectedNote(note.id);
    setTitle('');
    setContent('');
  };

  // اختيار ملاحظة
  const selectNoteHandler = (noteId) => {
    setSelectedNote(noteId);
    setCreating(false);
    setEditing(false);
  };

  // الانتقال إلى تعديل الملاحظة
  const editNoteHandler = () => {
    const note = notes.find(note => note.id === selectedNote);
    if (note) {
      setEditing(true);
      setTitle(note.title);
      setContent(note.content);
    }
  };

  // حفظ تعديل الملاحظة
  const updateNoteHandler = () => {
    if (!validate()) return;
    const updatedNotes = notes.map(note => {
      if (note.id === selectedNote) {
        return {
          ...note,
          title: title.trim(),
          content: content.trim()
        };
      }
      return note;
    });

    saveToLocalStorage('notes', updatedNotes);
    setNotes(updatedNotes);
    setEditing(false);
    setTitle('');
    setContent('');
  };

  // الانتقال إلى إضافة ملاحظة جديدة
  const addNoteHandler = () => {
    setCreating(true);
    setEditing(false);
    setTitle('');
    setContent('');
  };

  // حذف الملاحظة
  const deleteNoteHandler = () => {
    const updatedNotes = notes.filter(note => note.id !== selectedNote);
    saveToLocalStorage('notes', updatedNotes);
    setNotes(updatedNotes);
    setSelectedNote(null);
  };

  const getAddNote = () => {
    return (
      <NoteForm
        formTitle="ملاحظة جديدة"
        title={title}
        content={content}
        titleChanged={changeTitleHandler}
        contentChanged={changeContentHandler}
        submitText="حفظ"
        submitClicked={saveNoteHandler}
      />
    );
  };

  const getPreview = () => {
    if (notes.length === 0) {
      return <Message title="لا توجد ملاحظات" />;
    }

    if (!selectedNote) {
      return <Message title="الرجاء اختيار ملاحظة" />;
    }

    const note = notes.find(note => note.id === selectedNote);

    if (!note) {
      return <Message title="الرجاء اختيار ملاحظة" />;
    }

    let noteDisplay = (
      <div>
        <h2>{note.title}</h2>
        <p style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p>
      </div>
    );

    if (editing) {
      noteDisplay = (
        <NoteForm
          formTitle="تعديل ملاحظة"
          title={title}
          content={content}
          titleChanged={changeTitleHandler}
          contentChanged={changeContentHandler}
          submitText="تعديل"
          submitClicked={updateNoteHandler}
        />
      );
    }

    return (
      <div>
        {!editing && (
          <div className="note-operations">
            <a
              href="#edit"
              onClick={(e) => {
                e.preventDefault();
                editNoteHandler();
              }}
              title="تعديل"
            >
              <i className="fa fa-pencil-alt" />
            </a>

            <a
              href="#delete"
              onClick={(e) => {
                e.preventDefault();
                deleteNoteHandler();
              }}
              title="حذف"
            >
              <i className="fa fa-trash" />
            </a>
          </div>
        )}

        {noteDisplay}
      </div>
    );
  };

  return (
    <div className="App">
      <NotesContainer>
        <NoteList>
          {notes.map(note => (
            <Note
              key={note.id}
              title={note.title}
              noteClicked={() => selectNoteHandler(note.id)}
              active={selectedNote === note.id}
            />
          ))}
        </NoteList>
      </NotesContainer>
      <button className="add-btn" onClick={addNoteHandler} title="إضافة ملاحظة">+</button>

      <Preview>
        {creating ? getAddNote() : getPreview()}
      </Preview>
      {validationErrors.length !== 0 && <Alert validationMessages={validationErrors} />}
    </div>
  );
}

export default App;
