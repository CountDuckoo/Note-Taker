const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static('public'));

// send the notes page
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);



// get the notes from the database
app.get('/api/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/db/db.json'))
);

// post a new note to the database
app.post('/api/notes', (req, res) =>{
    // body has a title and text, the button won't appear unless the note has both so no need to check them
    const {title, text} = req.body;
    let newNote;

    // get the existing list of notes
    const data = fs.readFileSync('./db/db.json', 'utf8');
    const parsedNoteList = JSON.parse(data);
    const id = parsedNoteList.length;
    newNote = {title, text, id};
    parsedNoteList.push(newNote);
    fs.writeFile('./db/db.json', JSON.stringify(parsedNoteList, null, 4),
    (err2) => err2 ? console.error(err2) : console.info('Successfully saved note.'));
    const response = {
        status: 'success',
        body: newNote
    };
    console.log(response);
    res.status(201).json(response);
});

// delete a specified note from the database
app.delete('/api/notes/:note_id', (req, res) =>{
    const noteId = req.params.note_id;
    data = fs.readFileSync('./db/db.json', 'utf8');
    const parsedNoteList = JSON.parse(data);
    // the ids are in order from 0 to the list's length-1
    // the button only appears on notes, so it shouldn't be out of bounds
    // but just in case have error checking
    if(!noteId || noteId>=parsedNoteList.length || noteId<0){
        console.error('Bad Note ID for deletion');
        return res.status(400).json('Bad Note ID for deletion').end();
    }
    // remove the note
    const removedNote = parsedNoteList.splice(noteId, 1)[0];
    // update the ids for notes after that to set them to their current index
    for (let i=noteId; i<parsedNoteList.length; i++){
        parsedNoteList[i].id=i;
    }
    fs.writeFile('./db/db.json', JSON.stringify(parsedNoteList, null, 4),
    (err2) => err2 ? console.error(err2) : console.info('Successfully deleted note.'));
    const response = {
        status: 'success',
        body: removedNote
    };
    console.log(response);
    res.status(200).json(response);
});

// send the index page as a default, lower down so other get methods should take priority
app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);