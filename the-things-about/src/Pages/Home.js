import { useEffect, useState } from 'react'
import { Grid, IconButton } from '@mui/material';
import logo from '../img/TTAlogo.png'
import CustomButton from '../Components/CustomButton';
import CustomTable from '../Components/CustomTable';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchBar from '../Components/SearchBar';
import PopupAddBookmark from './PopupAddBookmark';
import { useSession, CombinedDataProvider } from "@inrupt/solid-ui-react";
import PopupWelcome from './PopupWelcome';
import {
    getSolidDataset,
    getThing,
    getThingAll,
    getUrlAll,
    getStringNoLocale,
    getPodUrlAll
} from "@inrupt/solid-client";
import { getOrCreateBookmarkList, getBookmarkList } from '../Functions';
import { SessionProvider } from "@inrupt/solid-ui-react";
const rdf = require('rdflib');

const NAME_PREDICATE = "http://schema.org/name";
const SCHEMA = new rdf.Namespace("http://schema.org/");
const DESCRIPTION_PREDICATE = "https://schema.org/Description";
const URL_PREDICATE = "https://schema.org/url";
const IDENTIFIER_PREDICATE = "https://schema.org/identifier";
const VCARD = new rdf.Namespace('http://www.w3.org/2006/vcard/ns#');
const FOAF = new rdf.Namespace('http://xmlns.com/foaf/0.1/');
const LDP = new rdf.Namespace('http://www.w3.org/ns/ldp#');
const RDF = new rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const BOOKMARKS = new rdf.Namespace('/bookmarks#');
const SPACE = new rdf.Namespace('http://www.w3.org/ns/pim/space#');

function Home() {
    const { session } = useSession();
    const [bookmarkList, setBookmarkList] = useState();
    const [bookmarkTableRows, setBookmarkTableRows] = useState([]);
    const STORAGE_PREDICATE = "http://www.w3.org/ns/pim/space#storage";
    const [containerUri, setContainerUri] = useState();
    const [tableKey, setTableKey] = useState(0);
    const [me, setMe] = useState();
    const store = rdf.graph();
    const fetcher = new rdf.Fetcher(store);

    useEffect(() => {
        if (!session || !session.info.isLoggedIn) return;

        (async () => {
            setMe(store.sym(session.info.webId));
            window.solidFetcher = session.clientAuthentication.fetch;

            const profileDataset = await getSolidDataset(session.info.webId, {
                fetch: session.fetch,
            });
            const profileThing = getThing(profileDataset, session.info.webId);
            const podsUrls = getUrlAll(profileThing, STORAGE_PREDICATE);
            const pod = podsUrls[0];
            setContainerUri(`${pod}bookmarks`);

            const list = await getOrCreateBookmarkList(containerUri, session.fetch);
            setBookmarkList(list);

            const _bookmarkTableData = getThingAll(list)
            var _bookmarkTableRows = [];
            _bookmarkTableData.map((bm) => {
                const _bookmarkName = getStringNoLocale(bm, NAME_PREDICATE)
                const _bookmarkType = getStringNoLocale(bm, IDENTIFIER_PREDICATE)
                const _bookmarkSource = getStringNoLocale(bm, URL_PREDICATE)
                const _bookmarkComment = getStringNoLocale(bm, DESCRIPTION_PREDICATE)
                _bookmarkTableRows = _bookmarkTableRows.concat(createData(_bookmarkName, _bookmarkSource, _bookmarkType, _bookmarkComment))
            })
            setBookmarkTableRows(_bookmarkTableRows);
        })();
    }, [session, session.info.isLoggedIn, containerUri, tableKey]);

    function createData(name, source, type, comment) {
        return {
            name,
            source,
            type,
            comment
        };
    }

    const refreshTable = () => {
        setTableKey(key => key + 1)
    };

    const handleSearch = async (searchText) => {
        //read name of a bookmark
        // const testbookmark = 'https://iremacildi.solidcommunity.net/bookmarks#test';
        // const testbookmark = 'https://iremacildi.solidcommunity.net/bookmarks';
        // console.log(testbookmark)
        // fetcher.load(testbookmark);
        // const names = store.each(rdf.sym(testbookmark), '#test');
        // console.log(names)

        //------------------------------------------------//
        //------------------------------------------------//

        //get bookmarks of friends
        fetcher.load(me);
        const friends = store.each(rdf.sym(me), FOAF('knows')); //get friends

        friends.forEach(async (friend) => {
            console.log(friend)

            await fetcher.load(friend);
            const podsUrls = await getPodUrlAll(friend.value) //friend's pods
            const pod = podsUrls[0]; //friend's pod
            var cont = `${pod}bookmarks#test`;
            const listt = await getBookmarkList(cont, session.fetch); //friend's bookmark dataset
            console.log(listt)
            await fetcher.load(store.sym(cont));
            console.log(store.sym(cont));
            console.log(me);
            const nmmm = store.each(rdf.sym(store.sym(cont)), SCHEMA('name')); //get friends
            console.log(nmmm);
            console.log(rdf.sym(store.sym(cont)))
            // console.log('girdim')
            // var ab = store.sym(cont)
            // console.log(ab);
            // var c = rdf.sym(ab)
            // console.log(c.doc())
            // var d = store.each(c, null);
            // console.log(d)
            // console.log('cikdim')
            // if (!listt) { alert('no bookmark') }
            // else {
            //     const _bookmarkTableData = await getThingAll(listt) //friend's bookmarks
            //     // console.log(_bookmarkTableData)
                
            //     _bookmarkTableData.forEach((data) => {
            //         // console.log(data)
            //         // console.log(me)
            //         // console.log(rdf.sym(me))
            //         // console.log(friend)
            //         // var bookmark = store.match(data, null, null, null)
            //         // console.log(bookmark)

            //         // console.log(store.match(friend, SCHEMA('name'), 'test', null))
            //     })

            //     // listt.graphs.graphs.

            //     // console.log('qqqq')
            // }
        });

        // const matchh = store.match()
    };

    const headCells = [
        {
            id: 'name',
            numeric: false,
            disablePadding: true,
            label: 'Name',
        },
        {
            id: 'source',
            numeric: true,
            disablePadding: false,
            label: 'Source',
        },
        {
            id: 'type',
            numeric: true,
            disablePadding: false,
            label: 'Type',
        },
    ];

    const restoreCallback = (url) => {
        console.log(`Use this function to navigate back to ${url}`);
    };

    return (
        <SessionProvider sessionId="session-provider-example"
            onError={console.log}
            restorePreviousSession
            onSessionRestore={restoreCallback}>
            <CombinedDataProvider
                datasetUrl={session.info.webId}
                thingUrl={session.info.webId}
            >
                <Grid container direction="row">
                    <PopupWelcome />
                    <Grid container item direction="column" lg={2} alignItems="flex-start">
                        <img width="100" src={logo} alt="TTA Logo" />
                    </Grid>
                    <Grid container item direction="column" lg={8} alignItems="center">
                        <Grid container spacing={1} justifyContent="center" alignItems="center" id="addmargin" direction="row">
                            <Grid container item direction="column" lg={11} alignItems="center"><SearchBar func={handleSearch} /></Grid>
                            <Grid container item direction="column" lg={1} alignItems="flex-end"><CustomButton onClick={() => alert("you will see filter soon.")}>Filter</CustomButton></Grid>
                        </Grid>
                        <Grid container item justifyContent="center" alignItems="center" id="addmargin" direction="row">
                            {bookmarkTableRows &&
                                <CustomTable key={tableKey} rows={bookmarkTableRows} headCells={headCells} />}
                        </Grid>
                        <Grid container item alignItems="flex-start" id="addmargin" direction="row">
                            <PopupAddBookmark bookmarkList={bookmarkList} containerUri={containerUri} refreshTable={refreshTable} />
                        </Grid>
                    </Grid>
                    <Grid container item direction="column" lg={2} alignItems="flex-end">
                        <IconButton size="medium" onClick={() => alert("you will see settings soon.")}>
                            <SettingsIcon sx={{ fontSize: 40, color: '#000000' }} />
                        </IconButton>
                    </Grid>
                </Grid>
            </CombinedDataProvider>
        </SessionProvider>
    );
}

export default Home;