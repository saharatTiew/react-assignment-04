//React's stuff
import React from 'react';
import { useState, useEffect } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'

//react bootstrap
import { FormText, Table, Modal, Button, Container, Row, Col } from 'react-bootstrap';
import { useForm } from "react-hook-form"
import Select from 'react-select'
import config from './config';
import { format } from 'date-fns'
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
//React icon pack
import { BsPlus, BsTrash, BsPencil } from "react-icons/bs"

//Firebase's required
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

if (firebase.apps.length === 0) {
    firebase.initializeApp(config);
}

const firestore = firebase.firestore()
const categoryRef = firestore.collection('category')
const journalRef = firestore.collection('money')

export default function Category() {

    //states
    const [categoryState, setCategoryState] = useState([])

    //show 
    const { register, handleSubmit } = useForm()
    const [showForm, setShowForm] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [tempData, setTempData] = useState({
        id: null,
        createdAt: new Date(),
        description: '',
        name: ''
    })

    const query = categoryRef.orderBy('createdAt', 'asc').limitToLast(100)
    const [data] = useCollectionData(query, { idField: 'id' })

    const journalQuery = journalRef.orderBy('createdAt', 'asc')
    var [isDeleted, setIsDeleted] = useState(false);
    const [journalDatas] = useCollectionData(journalQuery, { idField: 'id' })
    // console.log(journalDatas)


    console.log(journalDatas);

    useEffect(() => {
        //start observing & trigger if query #[data] changes
        if (data) {
            let mappedRowData = data.map((queryData, index) => {
                // console.log('aaaa', a);
                console.log(journalDatas);
                // console.log(jour)
                return (
                    <CategoryTableRow
                        data={queryData}
                        key={data[index].id}
                        id={data[index].id}
                        list={data[index]}
                        // journals={a.filter(x => x.category.id == queryData.id)}
                        onDeleteClicked={onItemDeleteListener}
                        onEditClick={handleEditClick}
                    />
                )
            })
            setCategoryState(mappedRowData)
            console.log("category works", "EUREKA!!!")
        }
    }, [data, journalDatas])

    const onSubmit = async (data, e) => {
        let preparedData = {
            // ...data,
            description: data.description,
            name: data.name,
            createdAt: new Date()
        }
        // console.log(e);
        if (isDeleted) {
            console.log('dsdssd');
        }

        if (editMode) {
            // const ids = journalDatas.filter(x => x.category.ids === data.id);
            console.log('sss', JSON.stringify(journalDatas))
            console.log(data.id);

            if (journalDatas) {
                console.log('what?');
                console.log('id', data.id);

                journalDatas.forEach(async (x) => {
                    console.log('cate', x.category.id)
                    if (x.category.id === data.id) {
                        const temp = x;
                        console.log('ss', temp);
                        temp.category.name = data.name;
                        await journalRef.doc(x.id)
                            .set(temp)
                            .then(() => console.log("moneyRef has been set"))
                            .catch((error) => {
                                console.error("Error: ", error);
                                alert(error)
                            });
                    }
                })
            }

            await categoryRef.doc(data.id)
                .set(preparedData)
                .then(() => console.log("moneyRef has been set"))
                .catch((error) => {
                    console.error("Error: ", error);
                    alert(error)
                });
            // console.error("adding.....")
        } else {
            await categoryRef
                .add(preparedData)
                .then(() => console.log("New record has been added."))
                .catch((error) => {
                    console.error("Errror:", error)
                    alert(error)
                })
        }
        handleCloseForm()
    }

    //LISTENER
    const onItemDeleteListener = async (id, list, journals) => {
        console.log('sss', journals);
        console.log('werrrrr', journalDatas)
        if (window.confirm("Are you sure?")) {
            if (journalDatas) {
                journalDatas.forEach(async (x) => {
                    console.log('data id', list.id);
                    console.log('cate id', x.category.id)
                    if (x.category.id === list.id) {
                        const temp2 = x;
                        console.log('journalRef', journalRef);
                        temp2.category.id = "unknown";
                        temp2.category.name = "Uncategorised";
                        await journalRef.doc(x.id)
                            .set(temp2)
                            .then(() => console.log("moneyRef has been set"))
                            .catch((error) => {
                                console.error("Error: ", error);
                                alert(error)
                            });
                    }
                })
            }
            await categoryRef.doc(id).delete()
        }
    }

    const handleEditClick = (id, list) => {
        // alert(JSON.stringify(list))
        let preparedData = {
            id: id,
            description: list.description,
            name: list.name,
            createdAt: new Date(list.createdAt.seconds)
        }
        console.log("handleEditClick", preparedData)
        // expect original data type for data.createdAt is Firebase's timestamp
        // convert to JS Date object and put it to the same field
        // if ('toDate' in data.createdAt) // guard, check wther toDate() is available in createdAt object.
        //   data.createdAt = data.createdAt.toDate()
        setTempData(preparedData)
        setEditMode(true)
        setShowForm(true)
    }

    // Handlers for Modal Add Form
    const handleshowForm = () => setShowForm(true)
    const handleCloseForm = () => { setShowForm(false) }

    return (
        <div style={{ "marginTop": 1 + '%' }}>
            <Container>
                <Row>
                    <Col>
                        <h1 >Category Management</h1>
                        <Button variant="outline-dark" onClick={handleshowForm}>
                            <BsPlus /> Add
                </Button>
                    </Col>
                </Row>
                <div style={{ "marginTop": 3 + '%' }}>
                    <Table stickyheader="true" aria-label="sticky table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categoryState}
                        </tbody>
                    </Table>
                </div>

                <Modal
                    show={showForm} onHide={handleCloseForm}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <input
                            type="hidden"
                            placeholder="createdAt"
                            ref={register({ required: false })}
                            name="id"
                            id="id"
                            defaultValue={format(tempData.createdAt, "yyyy-MM-dd")}
                        />
                        <input
                            type="hidden"
                            placeholder="ID"
                            ref={register({ required: false })}
                            name="id"
                            id="id"
                            defaultValue={tempData.id}
                        />
                        <Modal.Header closeButton>
                            <Modal.Title>
                                {editMode ? "Edit Category" : "Add New Category"}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                           
                            <Row>
                                <Col>
                                    <TextField style={{ margin: 8 }}
                                        fullWidth variant="outlined" label="Name"
                                        inputRef={register({ required: true })}
                                        defaultValue={tempData.name}
                                        name="name" />
                                </Col>
                            </Row>
                            
                            <Row>
                                <Col>
                                    <TextField style={{ margin: 8 }}
                                        fullWidth variant="outlined" label="Description"
                                        inputRef={register({ required: true })}
                                        defaultValue={tempData.description}
                                        name="description" />
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseForm}>
                                Close
                        </Button>
                            <Button variant={editMode ? "success" : "primary"} type="submit">
                                {editMode ? "Save Category" : "Add Category"}
                            </Button>
                        </Modal.Footer>
                    </form>
                </Modal>
            </Container>
        </div>
    )
}

//UI
function CategoryTableRow(props) {
    let data = props.data
    let id = props.id
    let list = props.list
    console.log(`props ${data}`)
    return (
        <tr>
            <td>
                <BsTrash onClick={() => props.onDeleteClicked(id, list)} />
                <BsPencil onClick={() => props.onEditClick(id, list)} />
            </td>
            <td>{data.name}</td>
            <td>{data.description}</td>
        </tr>
    )
}