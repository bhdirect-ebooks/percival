const getErrorMsg = (validity) => {
  const my_err_obj = validity.message
  const my_err_key = Object.keys(my_err_obj)[0]
  const my_err_val = my_err_obj[my_err_key]

  switch (my_err_key) {
  case 'end_book_before_start':
    return `${validity.end.b} cannot follow ${validity.start.b} in a range.`
  case 'end_book_not_exist':
    return `${validity.end.b} doesn't exist in the given translation.`
  case 'end_chapter_before_start':
    return `Chapter ${validity.end.c} cannot follow chapter ${validity.start.c} in a range.`
  case 'end_chapter_is_zero':
    return 'Sorry, there is no chapter zero.'
  case 'end_chapter_not_exist_in_single_chapter_book':
    return `${validity.end.b} has only one chapter`
  case 'end_chapter_not_exist':
    return `${validity.end.b} has ${my_err_val} chapters.`
  case 'end_chapter_not_numeric':
    return 'Non-numeric chapter'
  case 'end_verse_before_start':
    return `Verse ${validity.end.v} cannot follow verse ${validity.start.v} in a range.`
  case 'end_verse_is_zero':
    return 'Verse 0 does not exist.'
  case 'end_verse_not_exist':
    return `${validity.end.b} ${validity.end.c} has ${my_err_val} verses.`
  case 'end_verse_not_numeric':
    return 'Non-numeric verse'
  case 'start_book_not_defined':
    return `Context confusion; somehow the book is separated from chapter and verse.`
  case 'start_book_not_exist':
    return `${validity.start.b} doesn't exist in the given translation.`
  case 'start_chapter_is_zero':
    return 'Sorry, there is no chapter zero.'
  case 'start_chapter_not_exist_in_single_chapter_book':
    return `${validity.start.b} has only one chapter`
  case 'start_chapter_not_exist':
    return `${validity.start.b} has ${my_err_val} chapters.`
  case 'start_chapter_not_numeric':
    return 'Non-numeric chapter'
  case 'start_verse_is_zero':
    return 'Verse 0 does not exist.'
  case 'start_verse_not_exist':
    return `${validity.start.b} ${validity.start.c} has ${my_err_val} verses.`
  case 'start_verse_not_numeric':
    return 'Non-numeric verse'
  default:
    return 'Unknown error'
  }
}

module.exports = getErrorMsg
