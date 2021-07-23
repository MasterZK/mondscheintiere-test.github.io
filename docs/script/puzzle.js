    const PUZZLE_DIFFICULTY = 4;
    const PUZZLE_HOVER_TINT = '#009900';
    const PuzzleSizeDefault = { x: 780, y: 780 }
    const PuzzleSizeMedium = { x: 600, y: 600 } //at max width 800
    const PuzzleSizeMobile = { x: 380, y: 380 } //at max witth 500   

    var _stage;
    var _canvas;
    var _img;

    var _currentPuzzleSize;
    var _pieceWidth;
    var _pieceHeight;
    var _imgPieceWidth;
    var _imgPieceHeight;
    var _puzzleWidth;
    var _puzzleHeight;

    var _pieces;
    var _currentPiece;
    var _currentDropPiece;
    var gameStart;

    var mousePos;

    function init() {
        _img = new Image();
        _img.addEventListener('load', onImage, false);
        _img.src = "/img/cover_v2.jpg";
    }

    function onImage(e) {
        determineSize();
        calculatePuzzleSizes();

        setCanvas();
        initPuzzle();
    }

    function determineSize() {
        _currentPuzzleSize = PuzzleSizeDefault;

        if (window.innerWidth <= 800) {
            _currentPuzzleSize = PuzzleSizeMedium;
        }
        if (window.innerWidth <= 500) {
            _currentPuzzleSize = PuzzleSizeMobile;
        }
    }

    function calculatePuzzleSizes() {
        _img.style.height = _currentPuzzleSize.y;
        _img.style.width = _currentPuzzleSize.x;
        _imgPieceHeight = Math.floor(_img.height / PUZZLE_DIFFICULTY);
        _imgPieceWidth = Math.floor(_img.width / PUZZLE_DIFFICULTY);
        _pieceWidth = Math.floor(_currentPuzzleSize.x / PUZZLE_DIFFICULTY);
        _pieceHeight = Math.floor(_currentPuzzleSize.y / PUZZLE_DIFFICULTY);
        _puzzleWidth = _pieceWidth * PUZZLE_DIFFICULTY;
        _puzzleHeight = _pieceHeight * PUZZLE_DIFFICULTY;
    }

    function setCanvas() {
        _canvas = document.getElementById('puzzle');
        _stage = _canvas.getContext('2d');
        _canvas.width = _puzzleWidth;
        _canvas.height = _puzzleHeight;
        _canvas.style.border = "1px solid black";
    }

    function resizeCanvas() {
        var previousSize = _currentPuzzleSize;
        determineSize();
        if (previousSize == _currentPuzzleSize) {
            return;
        }

        calculatePuzzleSizes();
        _canvas.width = _puzzleWidth;
        _canvas.height = _puzzleHeight;
        if (gameStart) {
            updatePuzzle();
            return;
        }
        _stage.drawImage(_img, 0, 0, _img.width, _img.height, 0, 0, _puzzleWidth, _puzzleHeight);
        createTitle("Click to Start Puzzle");
    }

    function initPuzzle() {
        _pieces = [];
        mousePos = {
            x: 0,
            y: 0
        };
        _currentPiece = null;
        _currentDropPiece = null;
        _stage.drawImage(_img, 0, 0, _img.width, _img.height, 0, 0, _puzzleWidth, _puzzleHeight);
        createTitle("Click to Start Puzzle");
        buildPieces();
    }

    function createTitle(msg) {
        _stage.fillStyle = "#000000";
        _stage.globalAlpha = .4;
        _stage.fillRect(100, _puzzleHeight - 40, _puzzleWidth - 200, 40);
        _stage.fillStyle = "#FFFFFF";
        _stage.globalAlpha = 1;
        _stage.textAlign = "center";
        _stage.textBaseline = "middle";
        _stage.font = "20px Arial";
        _stage.fillText(msg, _puzzleWidth / 2, _puzzleHeight - 20);
    }

    function puzzleIDtoPos(ID) {
        var posX = ID.x * _pieceWidth;
        var posY = ID.y * _pieceHeight;
        return { x: posX, y: posY };
    }

    function puzzleIDtoImgPos(ID) {
        var posX = ID.x * _imgPieceWidth;
        var posY = ID.y * _imgPieceHeight;
        return { x: posX, y: posY };
    }

    function buildPieces() {
        gameStart = false;
        var i;
        var piece;
        var xPos = 0;
        var yPos = 0;
        for (i = 0; i < PUZZLE_DIFFICULTY * PUZZLE_DIFFICULTY; i++) {
            piece = {};
            piece.sx = xPos;
            piece.sy = yPos;
            _pieces.push(piece);
            xPos += 1;
            if (xPos == PUZZLE_DIFFICULTY) {
                xPos = 0;
                yPos += 1;
            }
        }
        window.addEventListener("resize", resizeCanvas);
        _canvas.onmousedown = shufflePuzzle;
    }

    function shufflePuzzle() {
        _pieces = shuffleArray(_pieces);
        gameStart = true;
        _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
        var i;
        var piece;
        var xPos = 0;
        var yPos = 0;
        for (i = 0; i < _pieces.length; i++) {
            piece = _pieces[i];
            piece.x = xPos;
            piece.y = yPos;
            var piecePos = puzzleIDtoImgPos({ x: piece.sx, y: piece.sy });
            var newPos = puzzleIDtoPos({ x: xPos, y: yPos });
            _stage.drawImage(_img, piecePos.x, piecePos.y, _imgPieceWidth, _imgPieceHeight, newPos.x, newPos.y, _pieceWidth, _pieceHeight);
            _stage.strokeRect(newPos.x, newPos.y, _pieceWidth, _pieceHeight);
            xPos += 1;
            if (xPos == PUZZLE_DIFFICULTY) {
                xPos = 0;
                yPos += 1;
            }
        }
        _canvas.onmousedown = onPuzzleClick;
    }

    function onPuzzleClick(e) {
        e = e || window.event;
        if (e.layerX || e.layerX == 0) {
            mousePos.x = e.layerX;
            mousePos.y = e.layerY;
        } else if (e.offsetX || e.offsetX == 0) {
            mousePos.x = e.offsetX;
            mousePos.y = e.offsetY;
        }

        _currentPiece = checkPieceClicked();
        if (_currentPiece != null) {
            var currentPiecePos = puzzleIDtoPos({ x: _currentPiece.x, y: _currentPiece.y });
            _stage.clearRect(currentPiecePos.x, currentPiecePos.y, _pieceWidth, _pieceHeight);
            _stage.save();
            _stage.globalAlpha = .9;
            var currentPieceImgPos = puzzleIDtoImgPos({ x: _currentPiece.sx, y: _currentPiece.sy });
            _stage.drawImage(_img, currentPieceImgPos.x, currentPieceImgPos.y, _imgPieceWidth, _imgPieceHeight, mousePos.x - (_pieceWidth / 2), mousePos.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
            _stage.restore();
            _canvas.onmousemove = updatePuzzle;
            _canvas.onmouseup = pieceDropped;
        }
    }

    function checkPieceClicked() {
        var i;
        var piece;
        for (i = 0; i < _pieces.length; i++) {
            piece = _pieces[i];
            var piecePos = puzzleIDtoPos({ x: piece.x, y: piece.y });
            if (mousePos.x < piecePos.x || mousePos.x > (piecePos.x + _pieceWidth) || mousePos.y < piecePos.y || mousePos.y > (piecePos.y + _pieceHeight)) {
                //PIECE NOT HIT
            } else {
                return piece;
            }
        }
        return null;
    }

    function updatePuzzle(e) {
        e = e || window.event;
        _currentDropPiece = null;
        if (e.layerX || e.layerX == 0) {
            mousePos.x = e.layerX;
            mousePos.y = e.layerY;
        } else if (e.offsetX || e.offsetX == 0) {
            mousePos.x = e.offsetX;
            mousePos.y = e.offsetY;
        }

        _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
        var i;
        var piece;
        for (i = 0; i < _pieces.length; i++) {
            piece = _pieces[i];
            if (piece == _currentPiece) {
                continue;
            }

            var PieceImgPos = puzzleIDtoImgPos({ x: piece.sx, y: piece.sy });
            var currentPiecePos = puzzleIDtoPos({ x: piece.x, y: piece.y });
            _stage.drawImage(_img, PieceImgPos.x, PieceImgPos.y, _imgPieceWidth, _imgPieceHeight, currentPiecePos.x, currentPiecePos.y, _pieceWidth, _pieceHeight);
            _stage.strokeRect(currentPiecePos.x, currentPiecePos.y, _pieceWidth, _pieceHeight);
            if (_currentDropPiece == null) {
                if (mousePos.x < currentPiecePos.x || mousePos.x > (currentPiecePos.x + _pieceWidth) || mousePos.y < currentPiecePos.y || mousePos.y > (currentPiecePos.y + _pieceHeight)) {
                    //NOT OVER
                } else {
                    _currentDropPiece = piece;
                    _stage.save();
                    _stage.globalAlpha = .4;
                    _stage.fillStyle = PUZZLE_HOVER_TINT;
                    var currentDropPiecePos = puzzleIDtoPos({ x: _currentDropPiece.x, y: _currentDropPiece.y });
                    _stage.fillRect(currentDropPiecePos.x, currentDropPiecePos.y, _pieceWidth, _pieceHeight);
                    _stage.restore();
                }
            }
        }
        _stage.save();
        _stage.globalAlpha = .6;
        var currentPieceImgPos = puzzleIDtoImgPos({ x: _currentPiece.sx, y: _currentPiece.sy });
        _stage.drawImage(_img, currentPieceImgPos.x, currentPieceImgPos.y, _imgPieceWidth, _imgPieceHeight, mousePos.x - (_pieceWidth / 2), mousePos.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
        _stage.restore();
        _stage.strokeRect(mousePos.x - (_pieceWidth / 2), mousePos.y - (_pieceHeight / 2), _pieceWidth, _pieceHeight);
    }

    function pieceDropped(e) {
        _canvas.onmousemove = null;
        _canvas.onmouseup = null;
        if (_currentDropPiece != null) {
            var tmp = {
                sx: _currentPiece.sx,
                sy: _currentPiece.sy
            };
            _currentPiece.sx = _currentDropPiece.sx;
            _currentPiece.sy = _currentDropPiece.sy;
            _currentDropPiece.sx = tmp.sx;
            _currentDropPiece.sy = tmp.sy;
        }
        resetPuzzleAndCheckWin();
    }

    function resetPuzzleAndCheckWin() {
        _stage.clearRect(0, 0, _puzzleWidth, _puzzleHeight);
        var gameWin = true;
        var i;
        var piece;
        for (i = 0; i < _pieces.length; i++) {
            piece = _pieces[i];

            var currentPieceImgPos = puzzleIDtoImgPos({ x: piece.sx, y: piece.sy });
            var currentPiecePos = puzzleIDtoPos({ x: piece.x, y: piece.y });
            _stage.drawImage(_img, currentPieceImgPos.x, currentPieceImgPos.y, _imgPieceWidth, _imgPieceHeight, currentPiecePos.x, currentPiecePos.y, _pieceWidth, _pieceHeight);
            _stage.strokeRect(currentPiecePos.x, currentPiecePos.y, _pieceWidth, _pieceHeight);
            if (piece.x != piece.sx || piece.y != piece.sy) {
                gameWin = false;
            }
        }
        if (gameWin) {
            setTimeout(gameOver, 500);
            gameStart = false;
        }
    }

    function gameOver() {
        _canvas.onmousedown = null;
        _canvas.onmousemove = null;
        _canvas.onmouseup = null;
        initPuzzle();
    }

    function shuffleArray(o) {
        for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }