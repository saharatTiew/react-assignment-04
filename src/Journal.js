import { useState, useEffect } from 'react'
import { Button, Modal } from 'react-bootstrap'
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Select from 'react-select'
import { format } from 'date-fns'
import { BsPlus, BsTrash, BsPencil } from "react-icons/bs";
import { useForm } from "react-hook-form"
import config from './config';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';

// Firebase
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

if (firebase.apps.length === 0) {
    firebase.initializeApp(config);
}
const firestore = firebase.firestore()

const useStyles = makeStyles((theme) => ({
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: '25ch',
    },
}));

export default function Journal() {
    const classes = useStyles();
    // Firebase stuff
    const moneyRef = firestore.collection('money');
    const categoryRef = firestore.collection('category');
    const query = moneyRef.orderBy('createdAt', 'asc').limitToLast(100);

    const categoryQuery = categoryRef.orderBy('createdAt', 'asc').limitToLast(100);
    const [data] = useCollectionData(query, { idField: 'id' });
    const [categories] = useCollectionData(categoryQuery, { idField: 'id' });
    // console.log(categories);

    // console.log("REACT_APP_PROJECT_ID", process.env.REACT_APP_PROJECT_ID)

    const [categoryOption, setCategoryOption] = useState([]);
    const [category, setCategory] = useState()
    const { register, handleSubmit } = useForm()
    const [showForm, setShowForm] = useState(false)
    const [records, setRecords] = useState([])
    const [total, setTotal] = useState(0)
    const [editMode, setEditMode] = useState(false)
    const [tempData, setTempData] = useState({
        id: null,
        createdAt: new Date(),
        description: '',
        amount: 0,
        category: categoryOption[0]
    })

    useEffect(() => {
        if (categories) { // Guard condition
            const tempCategories = [{ id: "0", name: '-- All -- ' }];
            tempCategories.push({id: "unknown", name: 'Uncategorised'});
            categories.forEach((x) => {
                tempCategories.push({ id: x.id, name: x.name });
            })
            setCategoryOption(tempCategories);
        }
    }, [categories])

    // This will be run when 'data' is changed.
    useEffect(() => {
        if (data) { // Guard condition
            let t = 0
            let r = data.map((d, i) => {
                // console.log('useEffect', format(d.createdAt.toDate(), "yyyy-MM-dd"))
                t += d.amount
                return (
                    <JournalRow
                        data={d}
                        i={i}
                        key={i}
                        onDeleteClick={handleDeleteClick}
                        onEditClick={handleEditClick}
                    />
                )
            })

            setRecords(r)
            setTotal(t)
        }
    }, [data])

    const handleCategoryFilterChange = (obj) => {
        // console.log('filter', obj)
        if (data) { // Guard condition      
            let t = 0
            let filteredData = data.filter(d => obj.id == 0 || d.category.id == obj.id)
            let r = filteredData.map((d, i) => {
                // console.log('filter', d)
                t += d.amount
                return (
                    <JournalRow data={d} i={i} onDeleteClick={handleDeleteClick}
                        onEditClick={handleEditClick} />
                )
            })

            setRecords(r)
            setTotal(t)
        }
    }

    // Handlers for Modal Add Form
    const handleshowForm = () => setShowForm(true)

    // Handlers for Modal Add Form
    const handleCloseForm = () => {
        setTempData({
            id: null,
            createdAt: new Date(),
            description: '',
            amount: 0,
            category: categoryOption[0]
        })
        setEditMode(false)
        setCategory({})
        setShowForm(false)
    }

    // Handle Add Form submit
    const onSubmit = async (data) => {
        // console.log("preparing data", "preparing")
        let preparedData = {
            // ...data,
            description: data.description,
            amount: parseFloat(data.amount),
            createdAt: new Date(data.createdAt),
            category: category
        }
        // console.log('onSubmit', preparedData)
        // console.log('state is here', editMode)
        if (editMode) {
            // Update record
            // console.log("UPDATING!!!!", data.id)
            await moneyRef.doc(data.id)
                .set(preparedData)
                .then(() => console.log("moneyRef has been set"))
                .catch((error) => {
                    console.error("Error: ", error);
                    alert(error)
                });
            // console.error("adding.....")
        } else {
            // Add to firebase
            // This is asynchronous operation, 
            // JS will continue process later, so we can set "callback" function
            // so the callback functions will be called when firebase finishes.
            // Usually, the function is called "then / error / catch".
            await moneyRef
                .add(preparedData)
                .then(() => console.log("New record has been added."))
                .catch((error) => {
                    console.error("Errror:", error)
                    alert(error)
                })
            // setShowForm(false)
        }
        handleCloseForm()
    }

    const handleCategoryChange = (obj) => {
        // console.log('handleCategoryChange', obj)
        setCategory(obj)
    }

    const handleDeleteClick = (id) => {
        // console.log('handleDeleteClick in Journal', id)
        if (window.confirm("Are you sure to delete this record?"))
            moneyRef.doc(id).delete()
    }

    const handleEditClick = (data) => {
        let preparedData = {
            id: data.id,
            description: data.description,
            amount: parseFloat(data.amount),
            createdAt: data.createdAt.toDate(),
            category: category
        }
        // console.log("handleEditClick", preparedData)
        // expect original data type for data.createdAt is Firebase's timestamp
        // convert to JS Date object and put it to the same field
        // if ('toDate' in data.createdAt) // guard, check wther toDate() is available in createdAt object.
        //   data.createdAt = data.createdAt.toDate()

        setEditMode(true)
        setTempData(preparedData)
        setCategory(data.category)
        setShowForm(true)
    }

    {console.log(category)}

    return (
        <div style={{ "marginTop": 1 + '%' }}>
            <Container>
                <Row>
                    <Col>
                        <h1>Journal</h1>
                        <Button variant="outline-dark" onClick={handleshowForm}>
                            <BsPlus /> Add
                    </Button>
                    </Col>
                    <Col>
                        Category:
          <Select
                            options={categoryOption}
                            getOptionLabel={x => x.name}
                            getOptionValue={x => x.id}
                            onChange={handleCategoryFilterChange}
                        />
                    </Col>

                </Row>
                <div style={{ "marginTop": 3 + '%' }}>
                    <Table striped hover>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records}
                        </tbody>
                        <tfooter>
                            <td colSpan={5}>
                                <h3>Total: {total}</h3>
                            </td>
                        </tfooter>
                    </Table>
                </div>


                <Modal
                    show={showForm} onHide={handleCloseForm}
                    aria-labelledby="contained-modal-title-vcenter"
                    centered>
                    <form onSubmit={handleSubmit(onSubmit)}>
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
                                {editMode ? "Edit Record" : "Add New Record"}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {/* <Row>
                                <Col>
                                    <label htmlFor="createdAt">Date</label>
                                </Col>
                                <Col>
                                    <input
                                        type="date"
                                        placeholder="Date"
                                        ref={register({ required: true })}
                                        name="createdAt"
                                        id="createdAt"
                                        defaultValue={format(tempData.createdAt, "yyyy-MM-dd")}
                                    />

                                </Col>
                            </Row> */}

                            <Row>
                                <Col>
                                    <TextField style={{ margin: 8 }}
                                        fullWidth variant="outlined" label="CreatedAt"
                                        type="date" defaultValue={format(tempData.createdAt, "yyyy-MM-dd")}
                                        inputRef={register({ required: true })}
                                        name="createdAt" />
                                </Col>
                            </Row>

                            {/* <Row>
                                <Col>
                                    <TextField style={{ margin: 8 }}
                                        select fullWidth variant="outlined"
                                        label="Select Category"
                                        inputRef={register}
                                        name="category"
                                        value= {tempData.category}
                                    >
                                        {categoryOption && categoryOption.map((option) => (
                                            option.id != 0  &&
                                            <MenuItem key={option.id} value={option.id}>
                                                {option.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Col>
                            </Row> */}

                            <Row>
                                <Col>
                                    <TextField style={{ margin: 8 }}
                                        fullWidth variant="outlined" label="Description"
                                        inputRef={register({ required: true })}
                                        defaultValue={tempData.description}
                                        name="description" />
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <TextField style={{ margin: 8 }}
                                        fullWidth variant="outlined" label="Amount"
                                        inputRef={register({ required: true })}
                                        type="number"
                                        name="amount"
                                        defaultValue={tempData.amount}
                                    />
                                </Col>
                            </Row>

                            <Row>
                                {/* <Col>
                                    <label htmlFor="category">Category</label>
                                </Col> */}
                                <Col>
                                    <div style={{ "paddingTop": 18.5,
                                                "paddingRight": 14,
                                                "paddingBottom": 18.5,
                                                "paddingLeft": 14}}>
                                    <Select
                                        id="category"
                                        name="category"
                                        value={category}
                                        placeholder="Category"
                                        options={categoryOption.filter(c => c.id !== "0" && c.id != "unknown")}
                                        onChange={handleCategoryChange}
                                        getOptionLabel={x => x.name}
                                        getOptionValue={x => x.id}
                                        ref={register}
                                    
                                    />
                                    </div>
                                </Col>
                            </Row>

                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseForm}>
                                Close
                        </Button>
                            <Button onClick={onModalFormSubmit(editMode, handleSubmit, onSubmit)} variant={editMode ? "success" : "primary"} type="submit">
                                {editMode ? "Save Record" : "Add Record"}
                            </Button>
                        </Modal.Footer>
                    </form>
                </Modal>
            </Container>
        </div>
    )
}

function onModalFormSubmit(editMode, handleSubmit, onSubmit) {
    console.log("modal click", "modal clicked")
    console.log(editMode.toString(), editMode.toString())
    handleSubmit(onSubmit)
}

function JournalRow(props) {
    let d = props.data
    let i = props.i
    // {console.log('sdss', d)}
    // console.log("JournalRow", d)
    return (
        <tr>
            <td>
                <BsTrash onClick={() => props.onDeleteClick(d.id)} />
                <BsPencil onClick={() => props.onEditClick(d)} />
            </td>
            <td>{format(d.createdAt.toDate(), "yyyy-MM-dd")}</td>
            <td>{d.description}</td>
            <td>{d.category.name}</td>
            <td>{d.amount}</td>
        </tr>
    )
}